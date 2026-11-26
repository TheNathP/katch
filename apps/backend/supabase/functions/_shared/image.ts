// Reads the format and dimensions of an uploaded photo from its header bytes,
// before decoding it, so oversized images are rejected without allocating them.

export type ImageFormat = "jpeg" | "png";
export type ImageHeader = {
  format: ImageFormat;
  width: number;
  height: number;
};

export const MIME_TYPES: Record<ImageFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
};
export const EXTENSIONS: Record<ImageFormat, string> = {
  jpeg: "jpg",
  png: "png",
};

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function readImageHeader(bytes: Uint8Array): ImageHeader | null {
  if (
    bytes.length >= 24 &&
    PNG_SIGNATURE.every((value, i) => bytes[i] === value)
  ) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return {
      format: "png",
      width: view.getUint32(16),
      height: view.getUint32(20),
    };
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return readJpegSize(bytes);
  }
  return null;
}

/** Walks the JPEG segments until a Start Of Frame marker, which holds the dimensions. */
function readJpegSize(bytes: Uint8Array): ImageHeader | null {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    if (marker === 0xff) {
      offset++;
      continue;
    }
    // Markers without a length field.
    if (
      marker === 0xd8 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      offset += 2;
      continue;
    }
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2) return null;
    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isStartOfFrame) {
      const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
      const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
      return { format: "jpeg", width, height };
    }
    offset += 2 + length;
  }
  return null;
}
