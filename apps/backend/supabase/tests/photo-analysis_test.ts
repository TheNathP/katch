import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";
import assert from "node:assert/strict";
import { PGlite } from "npm:@electric-sql/pglite@0.6.0";

import {
  analyzePhoto,
  downscale,
  type RgbaBitmap,
  scoreFromDeltaE,
} from "../functions/_shared/color/analysis.ts";
import {
  deltaE2000,
  hexToRgb,
  rgbToHex,
  rgbToLab,
} from "../functions/_shared/color/color.ts";
import { readImageHeader } from "../functions/_shared/image.ts";

const migrations = [
  "20261125090353_daily_challenges.sql",
  "20261125133000_friends.sql",
  "20261125162249_daily_leaderboard.sql",
  "20261126084642_leaderboard_player_photo.sql",
  "20261126095504_challenge_attempts.sql",
  "20261126103954_latest_photo_replaces_attempt.sql",
].map((name) => new URL(`../migrations/${name}`, import.meta.url));

/** Solid background with an optional square patch of another color. */
function bitmap(
  width: number,
  height: number,
  background: string,
  patch?: { hex: string; x: number; y: number; size: number },
): RgbaBitmap {
  const data = new Uint8ClampedArray(width * height * 4);
  const bg = hexToRgb(background);
  const fg = patch && hexToRgb(patch.hex);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inPatch =
        patch &&
        fg &&
        x >= patch.x &&
        x < patch.x + patch.size &&
        y >= patch.y &&
        y < patch.y + patch.size;
      const { r, g, b } = inPatch ? fg : bg;
      data.set([r, g, b, 255], (y * width + x) * 4);
    }
  }
  return { width, height, data };
}

Deno.test(
  "CIEDE2000 matches the reference values of Sharma et al. (2005)",
  () => {
    const pairs: [
      [number, number, number],
      [number, number, number],
      number,
    ][] = [
      [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
      [[50, 0, 0], [50, -1, 2], 2.3669],
      [[50, 2.5, 0], [73, 25, -18], 27.1492],
      [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
      [[22.7233, 20.0904, -46.694], [23.0331, 14.973, -42.5619], 2.0373],
    ];
    for (const [[l1, a1, b1], [l2, a2, b2], expected] of pairs) {
      assert.ok(
        Math.abs(
          deltaE2000({ l: l1, a: a1, b: b1 }, { l: l2, a: a2, b: b2 }) -
            expected,
        ) < 1e-4,
      );
    }
    const white = rgbToLab(hexToRgb("#FFFFFF"));
    assert.ok(
      Math.abs(white.l - 100) < 0.01 &&
        Math.abs(white.a) < 0.01 &&
        Math.abs(white.b) < 0.01,
    );
    assert.equal(rgbToHex({ r: 138.4, g: 63, b: 252 }), "#8A3FFC");
  },
);

Deno.test("the analysis keeps the photo area closest to the target", () => {
  // A small purple object on a green background: only the object counts.
  const photo = bitmap(640, 480, "#347D45", {
    hex: "#8A3FFC",
    x: 300,
    y: 200,
    size: 60,
  });
  const result = analyzePhoto(photo, "#8A3FFC");
  assert.equal(result.matchedHex, "#8A3FFC");
  assert.equal(result.score, 100);

  // Nothing purple: low score, and the best block is the background.
  const miss = analyzePhoto(bitmap(640, 480, "#347D45"), "#8A3FFC");
  assert.equal(miss.matchedHex, "#347D45");
  assert.ok(miss.score < 20);

  // A single stray pixel is averaged away by the downscale.
  const noisy = analyzePhoto(
    bitmap(640, 480, "#347D45", { hex: "#8A3FFC", x: 10, y: 10, size: 1 }),
    "#8A3FFC",
  );
  assert.ok(noisy.score < 20);

  // A close shade scores high but not perfect.
  const close = analyzePhoto(bitmap(100, 100, "#8040F0"), "#8A3FFC");
  assert.ok(close.score >= 85 && close.score < 100, `score ${close.score}`);
});

Deno.test("the analysis tells where the matched color is in the photo", () => {
  const patch = analyzePhoto(
    bitmap(640, 480, "#347D45", { hex: "#8A3FFC", x: 300, y: 200, size: 60 }),
    "#8A3FFC",
  );
  const center = {
    x: patch.matchedArea.x + patch.matchedArea.width / 2,
    y: patch.matchedArea.y + patch.matchedArea.height / 2,
  };
  assert.ok(center.x > 300 / 640 && center.x < 360 / 640, `x ${center.x}`);
  assert.ok(center.y > 200 / 480 && center.y < 260 / 480, `y ${center.y}`);
  assert.deepEqual(
    { width: patch.matchedArea.width, height: patch.matchedArea.height },
    { width: 0.0156, height: 0.0208 },
  );

  const plain = analyzePhoto(bitmap(640, 480, "#8A3FFC"), "#8A3FFC");
  assert.ok(
    Math.abs(plain.matchedArea.x + plain.matchedArea.width / 2 - 0.5) < 0.02,
  );
  assert.ok(
    Math.abs(plain.matchedArea.y + plain.matchedArea.height / 2 - 0.5) < 0.02,
  );
});

Deno.test("the photo is downscaled to at most 64 blocks per side", () => {
  assert.equal(downscale(bitmap(1280, 960, "#000000")).length, 64 * 48);
  assert.equal(downscale(bitmap(10, 10, "#000000")).length, 100);
  const transparent = { width: 2, height: 2, data: new Uint8Array(16) };
  assert.throws(() => analyzePhoto(transparent, "#000000"));
  assert.equal(scoreFromDeltaE(0), 100);
  assert.equal(scoreFromDeltaE(25), 50);
  assert.equal(scoreFromDeltaE(80), 0);
});

Deno.test("image headers give the real format and size", async () => {
  const image = new Image(320, 200);
  image.fill(Image.rgbaToColor(10, 20, 30, 255));
  assert.deepEqual(readImageHeader(await image.encodeJPEG(80)), {
    format: "jpeg",
    width: 320,
    height: 200,
  });
  assert.deepEqual(readImageHeader(await image.encode()), {
    format: "png",
    width: 320,
    height: 200,
  });
  assert.equal(
    readImageHeader(new TextEncoder().encode("GIF89a not an allowed image")),
    null,
  );
  assert.equal(readImageHeader(new Uint8Array([0xff, 0xd8, 0xff])), null);
});

Deno.test(
  "each new attempt replaces the previous one of the day, with no daily limit",
  async () => {
    const db = new PGlite();
    try {
      await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key);
      create schema storage;
      create table storage.buckets (
        id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]
      );
    `);
      for (const migration of migrations)
        await db.exec(await Deno.readTextFile(migration));

      const privileges = await db.query(`
      select
        has_table_privilege('authenticated', 'public.challenge_attempts', 'select') as client_reads,
        has_function_privilege('authenticated',
          'public.record_challenge_attempt(uuid, uuid, date, text, timestamptz, text, text, real, smallint)',
          'execute') as client_calls,
        (select relrowsecurity from pg_class where oid = 'public.challenge_attempts'::regclass) as rls,
        (select public from storage.buckets where id = 'challenge-photos') as public_bucket
    `);
      assert.deepEqual(privileges.rows[0], {
        client_reads: false,
        client_calls: false,
        rls: true,
        public_bucket: false,
      });

      const player = "00000000-0000-4000-8000-000000000001";
      await db.exec(`insert into auth.users (id) values ('${player}')`);
      await db.exec("set role service_role");
      const {
        rows: [challenge],
      } = await db.query<{ day: string; hex: string }>(
        `select to_char(challenge_date, 'YYYY-MM-DD') as day, color_hex as hex from public.get_or_create_daily_challenge()`,
      );

      const record = (
        score: number,
        hex = challenge.hex,
        day = challenge.day,
      ) =>
        db.query<{ replaced_photo_path: string | null; submitted_at: Date }>(
          `select * from public.record_challenge_attempt(
          gen_random_uuid(), $1, $2::date, $5, now() - interval '1 minute', $3, '#123456', 4.5, $4
        )`,
          [player, day, hex, score, `${player}/${day}/${score}.jpg`],
        );
      const photo = (score: number) =>
        `${player}/${challenge.day}/${score}.jpg`;

      // Each submission reports the photo it replaced, so the Edge Function can delete it.
      assert.equal((await record(60)).rows[0].replaced_photo_path, null);
      assert.equal((await record(80)).rows[0].replaced_photo_path, photo(60));
      // No daily limit, and a lower score still replaces a better one: only the latest counts.
      for (const score of [70, 50, 30, 20, 10, 90, 85, 75, 65])
        await record(score);
      const last = await record(40);
      assert.equal(last.rows[0].replaced_photo_path, photo(65));
      await assert.rejects(record(50, "#000000"), /challenge_ended/);
      await assert.rejects(
        record(50, challenge.hex, "2020-01-01"),
        /challenge_ended/,
      );

      const stored = await db.query<{
        count: number;
        score: string;
        photo: string;
        captured: boolean;
      }>(`
      select (select count(*)::int from public.challenge_attempts where taken_at is not null) as count,
             r.score::text as score, r.photo_object_path as photo,
             r.captured_at = (select submitted_at from public.challenge_attempts) as captured
      from public.social_results r where r.player_id = '${player}'
    `);
      // One attempt left, and the leaderboard shows it: its score, photo and server capture time.
      assert.deepEqual(stored.rows[0], {
        count: 1,
        score: "40.00",
        photo: photo(40),
        captured: true,
      });
    } finally {
      await db.close();
    }
  },
);
