import { access, readFile } from "node:fs/promises";
import process from "node:process";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

const [configText, fallbackText, index, appLoader, appConfig, appCamera, appMain, info, infoJs, stylesEntry, stylesCore, stylesPages, workflow, qr] = await Promise.all([
  read("packages.json"),
  read("packages-data.js"),
  read("index.html"),
  read("app.js"),
  read("app-config.js"),
  read("app-camera.js"),
  read("app-main.js"),
  read("info.html"),
  read("info.js"),
  read("styles.css"),
  read("styles-core.css"),
  read("styles-pages.css"),
  read(".github/workflows/pages.yml"),
  read("qr.html")
]);

const config = JSON.parse(configText);
const version = config.version;
const app = [appLoader, appConfig, appCamera, appMain].join("\n");
const styles = [stylesEntry, stylesCore, stylesPages].join("\n");

check(version === "20260714-v6", `Unexpected package version: ${version}`);
check(appLoader.includes(`const BOOT_VERSION = "${version}"`), "app.js bootstrap version does not match packages.json.");
check(appConfig.includes(`const VERSION = "${version}"`), "app-config.js VERSION does not match packages.json.");
check(index.includes(`styles.css?v=${version}`), "index.html stylesheet version does not match.");
check(stylesEntry.includes(`styles-core.css?v=${version}`), "styles.css core import version does not match.");
check(stylesEntry.includes(`styles-pages.css?v=${version}`), "styles.css page import version does not match.");
check(index.includes(`app.js?v=${version}`), "index.html app version does not match.");
check(index.includes(`packages-data.js?v=${version}`), "index.html fallback version does not match.");
check(info.includes(`styles.css?v=${version}`), "info.html stylesheet version does not match.");
check(info.includes(`info.js?v=${version}`), "info.html script version does not match.");
check(info.includes(`packages-data.js?v=${version}`), "info.html fallback version does not match.");

const expectedFallback = `window.MIRAT_PACKAGE_CONFIG=${JSON.stringify(config)};\n`;
check(fallbackText === expectedFallback, "packages-data.js is not generated from packages.json.");

for (const gender of ["female", "male"]) {
  for (let age = 18; age <= 75; age += 1) {
    const matches = config.packages.filter((item) => (
      age >= item.min &&
      age <= item.max &&
      (item.gender === "general" || item.gender === gender)
    ));
    check(matches.length === 1, `${gender}, age ${age}: expected exactly one package, found ${matches.length}.`);
  }
}

for (const age of [0, 17, 76, 120]) {
  for (const gender of ["female", "male"]) {
    const matches = config.packages.filter((item) => (
      age >= item.min &&
      age <= item.max &&
      (item.gender === "general" || item.gender === gender)
    ));
    check(matches.length === 0, `${gender}, age ${age}: should not match a package.`);
  }
}

const requiredIds = [
  "startExperienceBtn",
  "directPackageBtn",
  "cameraPathBtn",
  "openCameraBtn",
  "estimateBtn",
  "realInfoForm",
  "realAge",
  "formError",
  "riskForm",
  "packageCard",
  "showStaffCardBtn",
  "staffCard",
  "analyticsTodayGrid",
  "analyticsTotalGrid",
  "idleWarning",
  "continueSessionBtn"
];

for (const id of requiredIds) {
  check(index.includes(`id="${id}"`), `index.html is missing required ID: ${id}`);
}

check(!index.includes("maximum-scale=1"), "Viewport must allow user zoom.");
check(!index.includes("face-api.min.js"), "face-api.js must be loaded only after camera consent.");
check(!app.includes("Math.random"), "Application scripts must not generate a random apparent age.");
check(!app.includes("manualAge"), "Application scripts must not contain the former random-age fallback.");
check(!index.includes("الفحوصات المطلوبة"), "Use safe wording: الفحوصات المقترحة.");
check(!index.includes("شعار مملكة البحرين"), "Pilot must not claim an unofficial Bahrain emblem.");
check(index.includes("نسخة تجريبية"), "Pilot status must remain visible until official approval.");
check(info.includes("قيد المراجعة والاعتماد الرسمي"), "Information page must show pending approval status.");
check(info.includes('id="privacy"'), "Information page must contain a privacy section.");
check(qr.includes("https://aaaalmahdi.github.io/mirat-alitminan/"), "Mirror QR URL is missing.");
check(qr.includes("https://aaaalmahdi.github.io/mirat-alitminan/info.html"), "Information QR URL is missing.");
const printedQrUrls = [...qr.matchAll(/class="qr-url">([^<]+)</g)].map((match) => match[1]);
check(printedQrUrls.length === 2, "Expected exactly two printed QR URLs.");
check(printedQrUrls.every((url) => !url.includes("?v=")), "Printed QR URLs must not contain version parameters.");
check(styles.includes(":focus-visible"), "Visible keyboard focus styles are required.");
check(styles.includes("prefers-reduced-motion"), "Reduced-motion support is required.");
check(workflow.includes("npm test"), "Deployment workflow must run validation.");
check(workflow.includes("path: _site"), "Deployment workflow must publish only the staged _site directory.");
check(!workflow.includes("path: .\n"), "Deployment workflow must not publish the entire repository.");

const referencedAssets = [
  "assets/brand/mirat-mark.svg",
  "assets/qr/mirror-qr.svg",
  "assets/qr/info-packages-qr.svg"
];

for (const path of referencedAssets) {
  try {
    await access(new URL(path, root));
  } catch {
    failures.push(`Missing referenced asset: ${path}`);
  }
}

if (failures.length) {
  console.error("\nValidation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Validated ${config.packages.length} packages, all ages 18–75, safety wording, assets, and deployment configuration.`);
