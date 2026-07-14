import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const config = JSON.parse(await readFile(new URL("../packages.json", import.meta.url), "utf8"));
const expected = `window.MIRAT_PACKAGE_CONFIG=${JSON.stringify(config)};\n`;
const target = new URL("../packages-data.js", import.meta.url);

if (process.argv.includes("--check")) {
  const current = await readFile(target, "utf8");
  if (current !== expected) {
    console.error("packages-data.js is out of sync with packages.json.");
    process.exit(1);
  }
  console.log("Package fallback is in sync.");
} else {
  await writeFile(target, expected, "utf8");
  console.log("Generated packages-data.js.");
}
