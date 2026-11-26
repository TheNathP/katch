// When a photo was taken, read from its EXIF metadata. Pure TS, no React Native.

const EXIF_DATE = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
const EXIF_OFFSET = /^[+-]\d{2}:\d{2}$/;

/**
 * Returns the ISO date of `DateTimeOriginal` (or `DateTime`), using the EXIF
 * offset when present and the device time zone otherwise. `null` when missing or invalid.
 */
export function photoDateFromExif(exif: Record<string, unknown> | null | undefined): string | null {
  const raw = exif?.DateTimeOriginal ?? exif?.DateTime;
  const match = typeof raw === 'string' ? EXIF_DATE.exec(raw.trim()) : null;
  if (!match) return null;
  const [, year, month, day, hours, minutes, seconds] = match;
  const offset = exif?.OffsetTimeOriginal ?? exif?.OffsetTime;

  const time = typeof offset === 'string' && EXIF_OFFSET.test(offset)
    ? Date.parse(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offset}`)
    : new Date(+year, +month - 1, +day, +hours, +minutes, +seconds).getTime();
  return Number.isFinite(time) && time <= Date.now() ? new Date(time).toISOString() : null;
}
