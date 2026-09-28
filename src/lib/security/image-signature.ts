export async function hasValidImageSignature(
  file: File,
  type: "image/jpeg" | "image/png" | "image/webp",
) {
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  if (type === "image/jpeg") {
    return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  }

  if (type === "image/png") {
    return (
      header.length >= 8 &&
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47 &&
      header[4] === 0x0d &&
      header[5] === 0x0a &&
      header[6] === 0x1a &&
      header[7] === 0x0a
    );
  }

  return (
    header.length >= 12 &&
    String.fromCharCode(...header.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...header.slice(8, 12)) === "WEBP"
  );
}
