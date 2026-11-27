type Size = { width: number; height: number };

/** The visible image rectangle for a centered, contained photo. */
export function containPhoto(frame: Size, image: Size = frame) {
  if (image.width <= 0 || image.height <= 0) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }
  const scale = Math.min(frame.width / image.width, frame.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  return { left: (frame.width - width) / 2, top: (frame.height - height) / 2, width, height };
}
