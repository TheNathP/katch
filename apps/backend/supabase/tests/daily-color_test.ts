import assert from 'node:assert/strict';
import { PGlite } from 'npm:@electric-sql/pglite@0.6.0';

const migration = new URL('../migrations/20261125090353_daily_challenges.sql', import.meta.url);

type Challenge = {
  challenge_date: string;
  color_hex: string;
  ends_at: string;
  server_time: string;
};

Deno.test('the migration stores a single challenge per UTC date and keeps it server-only', async () => {
  const db = new PGlite();
  const realNow = Date.now;
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      set time zone 'Pacific/Honolulu';
    `);
    await db.exec(await Deno.readTextFile(migration));

    const privileges = await db.query(`
      select
        has_table_privilege('anon', 'public.daily_challenges', 'select') as client_reads,
        has_table_privilege('authenticated', 'public.daily_challenges', 'insert') as client_writes,
        has_function_privilege('authenticated', 'public.get_or_create_daily_challenge()', 'execute')
          as client_calls,
        (select relrowsecurity from pg_class where oid = 'public.daily_challenges'::regclass) as rls
    `);
    assert.deepEqual(privileges.rows[0], {
      client_reads: false,
      client_writes: false,
      client_calls: false,
      rls: true,
    });

    const midnight = Date.UTC(2026, 10, 26);
    Date.now = () => midnight - 100;
    await db.exec(`
      set role service_role;
      insert into public.daily_challenges (challenge_date, color_hex)
      values ((clock_timestamp() at time zone 'UTC')::date - 1, '#FF7A1A');
    `);
    const load = async () =>
      (await db.query<Challenge>(`
      select
        to_char(challenge_date, 'YYYY-MM-DD') as challenge_date, color_hex,
        ends_at::text, server_time::text
      from public.get_or_create_daily_challenge()
    `)).rows[0];
    const [first, second, third] = await Promise.all([load(), load(), load()]);
    assert.match(first.color_hex, /^#[0-9A-F]{6}$/);
    assert.notEqual(first.color_hex, '#FF7A1A');

    assert.equal(first.challenge_date, '2026-11-25');
    assert.equal(Date.parse(first.server_time), midnight - 100);
    assert.equal(Date.parse(first.ends_at), midnight);
    for (const challenge of [second, third]) {
      assert.equal(challenge.challenge_date, first.challenge_date);
      assert.equal(challenge.color_hex, first.color_hex);
      assert.equal(challenge.ends_at, first.ends_at);
    }
    Date.now = () => midnight;
    const next = await load();
    assert.equal(next.challenge_date, '2026-11-26');
    assert.equal(Date.parse(next.server_time), midnight);
    assert.equal(Date.parse(next.ends_at), midnight + 24 * 60 * 60 * 1_000);
    assert.notEqual(next.color_hex, first.color_hex);
    const stored = await db.query('select count(*)::int as count from public.daily_challenges');
    assert.deepEqual(stored.rows, [{ count: 3 }]);
  } finally {
    Date.now = realNow;
    await db.close();
  }
});

Deno.test('the Edge Function shares the daily color and returns each player their own submission', async () => {
  type Handler = (request: Request) => Response | Promise<Response>;
  const handlers: Handler[] = [];
  const serve = Deno.serve;
  Object.defineProperty(Deno, 'serve', { value: (handler: Handler) => handlers.push(handler) });
  try {
    await import('../functions/get-daily-color/index.ts');
  } finally {
    Object.defineProperty(Deno, 'serve', { value: serve });
  }
  const [handler] = handlers;
  assert.ok(handler);

  const fakeEnv = {
    SUPABASE_URL: 'https://supabase.test',
    SUPABASE_SECRET_KEYS: '{}',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
  };
  const savedEnv = new Map(Object.keys(fakeEnv).map((name) => [name, Deno.env.get(name)]));
  const originalFetch = globalThis.fetch;
  let databaseCalls = 0;
  const submissionLookups: string[] = [];

  try {
    for (const [name, value] of Object.entries(fakeEnv)) Deno.env.set(name, value);
    globalThis.fetch = async (input, init) => {
      const request = new Request(input, init);
      const url = new URL(request.url);
      const path = url.pathname;
      if (path === '/auth/v1/user') {
        const token = request.headers.get('Authorization');
        if (token !== 'Bearer player-one' && token !== 'Bearer player-two') {
          return Response.json({ message: 'Invalid token' }, { status: 401 });
        }
        return Response.json({ id: token.slice(7), role: 'authenticated', aud: 'authenticated' });
      }
      assert.equal(request.headers.get('apikey'), fakeEnv.SUPABASE_SERVICE_ROLE_KEY);
      if (path === '/rest/v1/challenge_attempts') {
        assert.equal(url.searchParams.get('select'), 'score,matched_hex,delta_e');
        assert.equal(url.searchParams.get('challenge_date'), 'eq.2026-11-25');
        const player = url.searchParams.get('player_id');
        assert.ok(player === 'eq.player-one' || player === 'eq.player-two');
        submissionLookups.push(player);
        return Response.json(player === 'eq.player-one' ? [
          { score: 12, matched_hex: '#FFCCAA', delta_e: 19.95 },
        ] : []);
      }
      assert.equal(path, '/rest/v1/rpc/get_or_create_daily_challenge');
      databaseCalls++;
      return Response.json({
        challenge_date: '2026-11-25',
        color_hex: '#8A3FFC',
        ends_at: '2026-11-26T00:00:00Z',
        server_time: '2026-11-25T16:00:00Z',
      });
    };

    const url = 'https://edge.test/functions/v1/get-daily-color';
    const request = (token: string, query = '') =>
      new Request(url + query, {
        headers: { Authorization: `Bearer ${token}` },
      });

    assert.equal((await handler(new Request(url, { method: 'POST' }))).status, 405);
    assert.equal((await handler(new Request(url))).status, 401);
    assert.equal((await handler(request('invalid'))).status, 401);
    assert.equal((await handler(request('player-one', '?date=2099-12-31'))).status, 400);
    assert.equal(databaseCalls, 0);
    assert.deepEqual(submissionLookups, []);

    for (const token of ['player-one', 'player-two']) {
      const response = await handler(request(token));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.deepEqual(await response.json(), {
        date: '2026-11-25',
        colorHex: '#8A3FFC',
        endsAt: '2026-11-26T00:00:00Z',
        serverTime: '2026-11-25T16:00:00Z',
        submission: token === 'player-one'
          ? { score: 12, scorePercent: 12, matchedHex: '#FFCCAA' }
          : null,
      });
    }
    assert.equal(databaseCalls, 2);
    assert.deepEqual(submissionLookups, ['eq.player-one', 'eq.player-two']);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of savedEnv) {
      if (value === undefined) Deno.env.delete(name);
      else Deno.env.set(name, value);
    }
  }
});
