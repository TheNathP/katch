// Pure color math: hex parsing, sRGB -> CIELAB conversion and CIEDE2000 distance.
// No Supabase or Deno APIs, unit-testable in isolation.

export type Rgb = { r: number; g: number; b: number };
export type Lab = { l: number; a: number; b: number };

const HEX_PATTERN = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i;

export function hexToRgb(hex: string): Rgb {
  const match = HEX_PATTERN.exec(hex);
  if (!match) throw new Error("Invalid hex color");
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
}

const toLinear = (channel: number) => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

// D65 reference white.
const WHITE = { x: 0.95047, y: 1, z: 1.08883 };
const labF = (t: number) =>
  t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116;

export function rgbToLab({ r, g, b }: Rgb): Lab {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const x = (lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375) / WHITE.x;
  const y = (lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175) / WHITE.y;
  const z = (lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041) / WHITE.z;
  const fx = labF(x);
  const fy = labF(y);
  const fz = labF(z);
  return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

const RAD = Math.PI / 180;
const POW25_7 = 25 ** 7;

/** CIEDE2000 color difference: ~1 is barely noticeable, > 50 means unrelated colors. */
export function deltaE2000(first: Lab, second: Lab): number {
  const c1 = Math.hypot(first.a, first.b);
  const c2 = Math.hypot(second.a, second.b);
  const cMean7 = ((c1 + c2) / 2) ** 7;
  const g = 0.5 * (1 - Math.sqrt(cMean7 / (cMean7 + POW25_7)));
  const a1 = first.a * (1 + g);
  const a2 = second.a * (1 + g);
  const cp1 = Math.hypot(a1, first.b);
  const cp2 = Math.hypot(a2, second.b);
  const hue = (a: number, b: number) => {
    if (a === 0 && b === 0) return 0;
    const h = Math.atan2(b, a) / RAD;
    return h >= 0 ? h : h + 360;
  };
  const h1 = hue(a1, first.b);
  const h2 = hue(a2, second.b);

  const dL = second.l - first.l;
  const dC = cp2 - cp1;
  let dh = 0;
  if (cp1 * cp2 !== 0) {
    dh = h2 - h1;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
  }
  const dH = 2 * Math.sqrt(cp1 * cp2) * Math.sin((dh / 2) * RAD);

  const lMean = (first.l + second.l) / 2;
  const cpMean = (cp1 + cp2) / 2;
  let hMean = h1 + h2;
  if (cp1 * cp2 !== 0) {
    if (Math.abs(h1 - h2) <= 180) hMean /= 2;
    else hMean = h1 + h2 < 360 ? (h1 + h2 + 360) / 2 : (h1 + h2 - 360) / 2;
  }

  const t =
    1 -
    0.17 * Math.cos((hMean - 30) * RAD) +
    0.24 * Math.cos(2 * hMean * RAD) +
    0.32 * Math.cos((3 * hMean + 6) * RAD) -
    0.2 * Math.cos((4 * hMean - 63) * RAD);
  const dTheta = 30 * Math.exp(-(((hMean - 275) / 25) ** 2));
  const cpMean7 = cpMean ** 7;
  const rc = 2 * Math.sqrt(cpMean7 / (cpMean7 + POW25_7));
  const sl =
    1 + (0.015 * (lMean - 50) ** 2) / Math.sqrt(20 + (lMean - 50) ** 2);
  const sc = 1 + 0.045 * cpMean;
  const sh = 1 + 0.015 * cpMean * t;
  const rt = -Math.sin(2 * dTheta * RAD) * rc;

  return Math.sqrt(
    (dL / sl) ** 2 +
      (dC / sc) ** 2 +
      (dH / sh) ** 2 +
      rt * (dC / sc) * (dH / sh),
  );
}
