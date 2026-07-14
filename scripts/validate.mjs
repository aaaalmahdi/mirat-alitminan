import { access, readFile } from "node:fs/promises";
import process from "node:process";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const failures = [];

const PACKAGE_VERSION = "20260714-v6";
const RELEASE_VERSION = "20260714-v7";

function check(condition, message) {
  if (!condition) failures.push(message);
}

const [
  configText,
  fallbackText,
  index,
  appLoader,
  appConfig,
  appApproval,
  appCamera,
  appMain,
  approvalData,
  info,
  infoJs,
  infoApproval,
  stylesEntry,
  stylesCore,
  stylesPages,
  officialBrand,
  workflow,
  qr,
  clinicalApproval,
  versionFile
] = await Promise.all([
  read("packages.json"),
  read("packages-data.js"),
  read("index.html"),
  read("app.js"),
  read("app-config.js"),
  read("app-approval.js"),
  read("app-camera.js"),
  read("app-main.js"),
  read("approval-data.js"),
  read("info.html"),
  read("info.js"),
  read("info-approval.js"),
  read("styles.css"),
  read("styles-core.css"),
  read("styles-pages.css"),
  read("official-brand.css"),
  read(".github/workflows/pages.yml"),
  read("qr.html"),
  read("CLINICAL_APPROVAL.md"),
  read("VERSION.txt")
]);

const config = JSON.parse(configText);
const packageVersion = config.version;
const app = [appLoader, appConfig, appApproval, appCamera, appMain].join("\n");
const styles = [stylesEntry, stylesCore, stylesPages, officialBrand].join("\n");

check(packageVersion === PACKAGE_VERSION, `Unexpected package configuration version: ${packageVersion}`);
check(appLoader.includes(`const BOOT_VERSION = "${RELEASE_VERSION}"`), "app.js release version is not V7.");
check(appConfig.includes(`const VERSION = "${PACKAGE_VERSION}"`), "app-config.js package VERSION does not match packages.json.");
check(index.includes(`styles.css?v=${PACKAGE_VERSION}`), "index.html stylesheet version does not match package release baseline.");
check(index.includes(`official-brand.css?v=${RELEASE_VERSION}`), "index.html official brand stylesheet is missing.");
check(index.includes(`app.js?v=${RELEASE_VERSION}`), "index.html V7 app bootstrap reference is missing.");
check(index.includes(`packages-data.js?v=${PACKAGE_VERSION}`), "index.html package fallback version does not match.");
check(index.includes(`approval-data.js?v=${RELEASE_VERSION}`), "index.html approval data reference is missing.");
check(stylesEntry.includes(`styles-core.css?v=${PACKAGE_VERSION}`), "styles.css core import version does not match.");
check(stylesEntry.includes(`styles-pages.css?v=${PACKAGE_VERSION}`), "styles.css page import version does not match.");
check(info.includes(`styles.css?v=${PACKAGE_VERSION}`), "info.html stylesheet version does not match.");
check(info.includes(`official-brand.css?v=${RELEASE_VERSION}`), "info.html official brand stylesheet is missing.");
check(info.includes(`packages-data.js?v=${PACKAGE_VERSION}`), "info.html package fallback version does not match.");
check(info.includes(`approval-data.js?v=${RELEASE_VERSION}`), "info.html approval data reference is missing.");
check(info.includes(`info.js?v=${PACKAGE_VERSION}`), "info.html information script version does not match.");
check(info.includes(`info-approval.js?v=${RELEASE_VERSION}`), "info.html approval copy script is missing.");
check(qr.includes(`official-brand.css?v=${RELEASE_VERSION}`), "qr.html official brand stylesheet is missing.");
check(appLoader.includes('loadApplicationScript("app-approval.js")'), "The app approval overlay must load before app-main.js.");

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
check(![index, info, qr].some((file) => file.includes("نسخة تجريبية")), "Pilot identity wording must be removed after project approval.");
check(![index, info, qr].some((file) => file.includes("mirat-mark.svg")), "The neutral pilot mark must not remain active.");
check([index, info, qr].every((file) => file.includes("primary-healthcare-centres-emblem.svg")), "The supplied official emblem must be used on all public pages.");
check([index, info, qr].every((file) => file.includes("مراكز الرعاية الصحية الأولية")), "Official organisation label is missing from a public page.");
check(index.includes("تم اعتماد جدول الباقات"), "Welcome page must state the project package approval.");
check(info.includes("معتمد للاستخدام في المشروع"), "Information page must show the approved package status.");
check(qr.includes("الهوية والباقات المعتمدة للمشروع"), "QR page must show the identity and package approval note.");
check(approvalData.includes(`releaseVersion: "${RELEASE_VERSION}"`), "approval-data.js release version is incorrect.");
check(approvalData.includes(`packageConfigVersion: "${PACKAGE_VERSION}"`), "approval-data.js package version is incorrect.");
check(approvalData.includes('approvedBy: "Abdulla"'), "Project approval owner is missing.");
check(clinicalApproval.includes("Approved unchanged"), "CLINICAL_APPROVAL.md must record the unchanged approval decision.");
check(versionFile.includes(`version=${RELEASE_VERSION}`), "VERSION.txt release version is incorrect.");
check(versionFile.includes(`package_config=${PACKAGE_VERSION}`), "VERSION.txt package configuration version is missing.");
check(qr.includes("https://aaaalmahdi.github.io/mirat-alitminan/"), "Mirror QR URL is missing.");
check(qr.includes("https://aaaalmahdi.github.io/mirat-alitminan/info.html"), "Information QR URL is missing.");

const printedQrUrls = [...qr.matchAll(/class="qr-url">([^<]+)</g)].map((match) => match[1]);
check(printedQrUrls.length === 2, "Expected exactly two printed QR URLs.");
check(printedQrUrls.every((url) => !url.includes("?v=")), "Printed QR URLs must not contain version parameters.");
check(styles.includes(":focus-visible"), "Visible keyboard focus styles are required.");
check(styles.includes("prefers-reduced-motion"), "Reduced-motion support is required.");
check(officialBrand.includes(".official-emblem"), "Official emblem sizing rules are missing.");
check(workflow.includes("npm test"), "Deployment workflow must run validation.");
check(workflow.includes("path: _site"), "Deployment workflow must publish only the staged _site directory.");
check(!workflow.includes("path: .\n"), "Deployment workflow must not publish the entire repository.");
for (const deploymentFile of ["official-brand.css", "approval-data.js", "app-approval.js", "info-approval.js"]) {
  check(workflow.includes(deploymentFile), `Deployment workflow is missing ${deploymentFile}.`);
}

const referencedAssets = [
  "assets/brand/primary-healthcare-centres-emblem.svg",
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

console.log(`Validated ${config.packages.length} unchanged packages, all ages 18–75, V7 identity approval, safety wording, assets, and deployment configuration.`);
