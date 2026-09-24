/**
 * One-time image optimizer: converts public/images/*.png to WebP at the
 * source's native width (sources are ~500px, so no upscaling/downscaling).
 *
 * Usage:
 *   node scripts/optimize-images.mjs            # convert, keep PNGs
 *   node scripts/optimize-images.mjs --delete   # convert, delete PNGs
 */
import { readdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/images");
const DELETE = process.argv.includes("--delete");

async function main() {
  const files = (await readdir(DIR)).filter((f) => f.endsWith(".png"));
  let before = 0;
  let after = 0;

  for (const file of files) {
    const src = path.join(DIR, file);
    const input = await readFile(src);
    const out = path.join(DIR, `${path.parse(file).name.replace(/\s+/g, "-")}.webp`);
    const info = await sharp(input).webp({ quality: 80 }).toFile(out);
    before += input.length;
    after += info.size;
    console.log(
      `${path.basename(out)}  ${(info.size / 1024).toFixed(0)} KB  (was ${(
        input.length / 1024
      ).toFixed(0)} KB)`
    );
  }

  if (DELETE) {
    for (const file of files) await unlink(path.join(DIR, file));
    console.log(`\ndeleted ${files.length} source PNGs`);
  }

  console.log(
    `\nDone: ${files.length} images. ${(before / 1048576).toFixed(2)} MB -> ${(
      after / 1048576
    ).toFixed(2)} MB`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
