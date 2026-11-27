import Svg, { Circle, Defs, G, Path, Pattern, Rect } from 'react-native-svg';

import { ComicFeedbackColors } from '@/styles/theme';

const glyphs = {
  V: { width: 40, path: 'M0 6 L13 1 L22 43 L29 0 L42 3 L31 67 L14 64 Z' },
  A: { width: 40, path: 'M0 63 L14 1 L30 0 L42 64 L28 68 L25 51 L14 52 L11 66 Z M17 39 L23 39 L20 21 Z' },
  L: { width: 33, path: 'M4 2 L19 0 L15 53 L35 52 L32 66 L0 64 Z' },
  I: { width: 20, path: 'M4 3 L21 0 L17 65 L0 67 Z' },
  D: { width: 43, path: 'M4 2 L21 0 L34 5 L42 16 L44 43 L37 57 L22 65 L0 67 Z M17 14 L14 51 L21 50 L29 43 L31 26 L26 16 Z' },
  É: { width: 35, path: 'M3 4 L37 0 L34 14 L18 17 L17 27 L31 24 L29 38 L16 41 L15 53 L36 49 L33 65 L0 68 Z M13 -4 L21 -17 L37 -19 L26 -6 Z' },
  R: { width: 40, path: 'M3 4 L23 0 L36 5 L42 17 L39 30 L30 36 L44 60 L30 67 L15 42 L13 65 L0 68 Z M18 15 L16 28 L24 26 L28 20 L24 15 Z' },
  T: { width: 39, path: 'M1 6 L42 0 L39 16 L27 18 L22 65 L7 68 L11 20 L0 22 Z' },
  '!': { width: 22, path: 'M3 0 L24 2 L17 46 L5 49 Z M4 54 L16 53 L19 58 L16 66 L5 69 L0 62 Z' },
} as const;

const angles = [-11, -7, 2, -5, 4, 1, 8];
const heights = [3, -2, 2, -3, 0, -2, -4];

function lettering(word: readonly (keyof typeof glyphs)[]) {
  let x = 0;
  const letters = word.map((character, index) => {
    const letter = glyphs[character];
    const transform = `translate(${x} ${heights[index]}) rotate(${angles[index]} ${letter.width / 2} 33)`;
    x += letter.width - 2;
    return { path: letter.path, transform };
  });
  return { letters, width: x };
}

const successType = lettering(['V', 'A', 'L', 'I', 'D', 'É', '!']);
const missType = lettering(['R', 'A', 'T', 'É', '!']);

export function ComicHeadline({ validated }: { validated: boolean }) {
  const { letters, width } = validated ? successType : missType;

  return (
    <Svg width="100%" height="100%" viewBox={`-15 -29 ${width + 38} 115`}>
      <G transform="translate(7 9)">
        {letters.map(({ path, transform }) => (
          <Path key={path} d={path} transform={transform} fillRule="evenodd"
            fill={ComicFeedbackColors.ink} stroke={ComicFeedbackColors.ink} strokeWidth={8} />
        ))}
      </G>
      {letters.map(({ path, transform }) => (
        <Path key={path} d={path} transform={transform} fillRule="evenodd"
          fill={ComicFeedbackColors.ink} stroke={ComicFeedbackColors.ink} strokeWidth={7} />
      ))}
      {letters.map(({ path, transform }) => (
        <Path key={path} d={path} transform={transform} fillRule="evenodd" fill={ComicFeedbackColors.paper} />
      ))}
    </Svg>
  );
}

export function ComicBackdrop({ validated }: { validated: boolean }) {
  const palette = validated ? ComicFeedbackColors.validated : ComicFeedbackColors.rejected;

  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 700" preserveAspectRatio="none">
      <Defs>
        <Pattern id="comicPrint" width="4.5" height="4.5" patternUnits="userSpaceOnUse">
          <Circle cx="1.1" cy="1.1" r="0.8" fill={ComicFeedbackColors.ink} opacity={0.3} />
        </Pattern>
      </Defs>
      <Rect width="360" height="700" fill={palette.background} />
      <Path d="M0 140 L360 26 V540 L0 692Z" fill={palette.middle} />
      <Path d="M360 425 L0 594 V700 H360Z M0 0 H360 V23 L0 116Z" fill={palette.shade} />
      <Path d="M0 224 L107 306 L0 260Z M360 196 L269 281 L360 212Z M0 485 L113 419 L0 521Z M360 430 L250 394 L360 471Z" fill={palette.accent} />
      <Path
        d="M0 66 L121 258 L22 100Z M0 154 L80 266 L0 206Z M0 292 L84 325 L0 312Z M0 356 L92 347 L0 371Z M0 428 L95 388 L0 449Z M0 590 L120 432 L19 606Z M0 674 L130 489 L32 700Z M56 700 L142 545 L93 700Z M296 700 L232 536 L332 700Z M360 632 L243 465 L360 574Z M360 527 L269 446 L360 490Z M360 378 L273 366 L360 394Z M360 291 L276 312 L360 311Z M360 115 L250 245 L360 151Z M351 0 L234 220 L322 0Z"
        fill={ComicFeedbackColors.ink}
      />
      <Rect width="360" height="700" fill="url(#comicPrint)" />
    </Svg>
  );
}

export function ComicOutcomeMark() {
  const palette = ComicFeedbackColors.rejected;
  const path = 'M11 10 L35 33 M35 10 L11 33';
  return (
    <Svg width="100%" height="100%" viewBox="0 0 48 48">
      <Path d={path} stroke={ComicFeedbackColors.ink} strokeWidth={13} strokeLinecap="square" fill="none" />
      <Path d={path} stroke={palette.accent} strokeWidth={5.5} strokeLinecap="square" fill="none" />
    </Svg>
  );
}
