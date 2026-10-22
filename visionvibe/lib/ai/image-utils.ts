import sharp from "sharp";

/**
 * Pollinations stamps a small "pollinations.ai" logo into the bottom-right
 * corner of anonymous renders. The `nologo` flag is not honoured on the free
 * tier, so we crop the thin branding strip off the bottom edge instead —
 * the composition is unaffected and the result is clean for the gallery.
 */
export async function stripProviderBranding(
  buffer: Buffer,
  options: { crop?: boolean } = {}
): Promise<Buffer> {
  if (options.crop === false) return buffer;

  try {
    const image = sharp(buffer);
    const meta = await image.metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    if (!width || !height) return buffer;

    // The logo strip is roughly 4.5% of the height, capped at 34px.
    const strip = Math.min(34, Math.max(10, Math.round(height * 0.045)));

    return await sharp(buffer)
      .extract({ left: 0, top: 0, width, height: height - strip })
      .jpeg({ quality: 92 })
      .toBuffer();
  } catch {
    return buffer;
  }
}
