const INFO_VERSION = "20260714-v6";
const config = window.MIRAT_PACKAGE_CONFIG;
if (!config || config.version !== INFO_VERSION) {
  throw new Error("Package information is unavailable.");
}

const INFO_COPY = {
  en: {
    skipToContent: "Skip to content",
    brandName: "Mirat Al-Itminan",
    pilotLabel: "Pilot version — awaiting official identity",
    service: "Early chronic disease screening",
    pageTitle: "Service and preventive package information",
    pageLead: "A concise reference covering the purpose, target groups, packages, eligibility, and privacy. This page does not open the camera or request personal information.",
    lastUpdated: "Content last updated:",
    statusExplanation: "This version is not a final clinical approval. The package table must be confirmed by the responsible authority before the official logo is used.",
    whatIsService: "What is the service?",
    serviceDescription: "A service for early screening of non-communicable and chronic diseases. It provides awareness and initial guidance based on age and gender, after which qualified staff review the electronic health record to confirm eligibility.",
    servicePointOne: "Intended for Bahraini citizens and their families, subject to the service's official process.",
    servicePointTwo: "The age range used in this experience is 18 to 75 years.",
    servicePointThree: "The service may be available in person or through telemedicine, depending on the health centre's process.",
    visionMission: "Vision and mission",
    visionLabel: "Vision:",
    visionText: "A healthy and safe society through integrated health services delivered fairly, efficiently, and with high quality.",
    missionLabel: "Mission:",
    missionText: "Ensure accessible and comprehensive primary care covering prevention, treatment, promotion, rehabilitation, and palliative care according to the needs of individuals, families, and the community.",
    valuesTitle: "Core values",
    valueOne: "Individual health at the centre of care",
    valueTwo: "Equity",
    valueThree: "Teamwork",
    valueFour: "Evidence-based care",
    valueFive: "Transparency",
    valueSix: "Community partnership",
    whyScreening: "Why does early screening matter?",
    whyOne: "Support early detection before symptoms appear.",
    whyTwo: "Help prevent future health complications.",
    whyThree: "Create better opportunities for timely intervention and treatment.",
    whyFour: "Provide health education and guidance for healthier living.",
    whyFive: "Support health and quality of life.",
    packagesTitle: "Preventive packages",
    packagesLead: "The following packages are for initial guidance only. Each card shows core screenings; conditional screenings may be added according to age and gender.",
    conditionalTitle: "Conditional screenings",
    conditionalLead: "The following screenings may appear when the age and gender criteria apply. Final eligibility remains subject to the health record.",
    eligibilityTitle: "What does eligibility mean?",
    eligibilityOne: "Age and gender provide initial guidance only. Final eligibility for each screening depends on age, gender, previous screening dates and results, and the electronic health record.",
    eligibilityTwo: "Qualified staff confirm which screenings are due. The plan may differ according to individual health circumstances and updated official guidance.",
    eligibilityThree: "Current notes: cervical smear up to age 65, prostate screening up to age 70, and colon screening up to age 75, subject to eligibility.",
    privacyTitle: "Privacy and camera use",
    privacyOne: "This page does not open the camera or request age or gender. In the mirror experience, the camera image is processed on the user's device during the session. The app does not upload the image or save it to a database.",
    privacyTwo: "Aggregate usage indicators are stored locally on the device only, such as starting and completing the experience. They do not include a name, photo, personal identifier, or individual age.",
    privacyThree: "The hosting provider may record standard technical operational data, such as an IP address, under its own policy.",
    faqTitle: "Frequently asked questions",
    faqOneQ: "Does apparent age determine the package?",
    faqOneA: "No. Apparent age is an optional, non-medical experience. The initial package uses real age and gender.",
    faqTwoQ: "What happens if the age model is unavailable?",
    faqTwoA: "The app does not show a replacement or random number. You can continue to the package without the camera.",
    faqThreeQ: "Why do I still need staff after seeing the result?",
    faqThreeA: "Previous screening dates and results and the electronic health record are needed to confirm eligibility.",
    faqFourQ: "Is the content finally approved?",
    faqFourA: "The current version is a pilot pending official review and approval. The approval status and review date will be shown here when completed.",
    openMirror: "Open Mirat Al-Itminan",
    viewQr: "View the mirror and information QR codes",
    footerDisclaimer: "This experience is for health awareness and initial guidance only. It is not a medical diagnosis and does not determine final screening eligibility."
  }
};

const INFO_STRINGS = {
  ar: {
    lang: "English",
    general: "للجميع",
    female: "للإناث",
    male: "للذكور",
    age: "العمر",
    coreChecks: "الفحوصات الأساسية",
    range: (min, max) => `${min}–${max} سنة`,
    updatedDate: (date) => new Intl.DateTimeFormat("ar-BH", { dateStyle: "long" }).format(date),
    loadFail: "تعذر تحميل تفاصيل الباقات."
  },
  en: {
    lang: "العربية",
    general: "All genders",
    female: "Female",
    male: "Male",
    age: "Age",
    coreChecks: "Core screenings",
    range: (min, max) => `${min}–${max} years`,
    updatedDate: (date) => new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(date),
    loadFail: "Package details could not be loaded."
  }
};

const ANALYTICS_KEY = "mirat_analytics";
let lang = localStorage.getItem("mirat_lang") === "en" ? "en" : "ar";

function text(value) {
  return value?.[lang] ?? value?.ar ?? value?.en ?? "";
}

function emptyBucket() {
  return { packages: {} };
}

function normalizeAnalytics(raw) {
  if (raw && raw.schema === 2 && raw.totals && raw.days) return raw;
  const migrated = { schema: 2, totals: emptyBucket(), days: {} };
  if (raw && typeof raw === "object") {
    Object.entries(raw).forEach(([key, value]) => {
      if (key === "packages" && value && typeof value === "object") {
        migrated.totals.packages = { ...value };
      } else if (typeof value === "number") {
        migrated.totals[key] = value;
      }
    });
  }
  return migrated;
}

function trackInfoView() {
  try {
    const analytics = normalizeAnalytics(JSON.parse(localStorage.getItem(ANALYTICS_KEY) || "{}"));
    const day = new Date().toISOString().slice(0, 10);
    analytics.days[day] = analytics.days[day] || emptyBucket();
    analytics.totals.infoViews = (analytics.totals.infoViews || 0) + 1;
    analytics.days[day].infoViews = (analytics.days[day].infoViews || 0) + 1;
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  } catch {
    // Analytics are optional and must never block the information page.
  }
}

function applyLanguage() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.title = lang === "ar"
    ? "معلومات الخدمة والباقات — مرآة الاطمئنان"
    : "Service and package information — Mirat Al-Itminan";

  if (lang === "en") {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const translated = INFO_COPY.en[element.dataset.i18n];
      if (translated) element.textContent = translated;
    });
  }

  document.querySelector("#infoLangToggle").textContent = INFO_STRINGS[lang].lang;
  document.querySelector("#contentStatus").textContent = text(config.metadata?.contentStatus);

  const date = new Date(`${config.metadata?.lastUpdated || "2026-07-14"}T00:00:00`);
  const time = document.querySelector("#lastUpdatedDate");
  time.dateTime = config.metadata?.lastUpdated || "2026-07-14";
  time.textContent = INFO_STRINGS[lang].updatedDate(date);
}

function createList(items) {
  const list = document.createElement("ul");
  list.className = "check-list";
  items.forEach((item) => {
    const row = document.createElement("li");
    row.textContent = item;
    list.append(row);
  });
  return list;
}

function renderPackages() {
  const container = document.querySelector("#infoPackages");
  container.replaceChildren();

  config.packages.forEach((packageItem) => {
    const card = document.createElement("article");
    card.className = "package-overview";
    card.style.setProperty("--package-color", packageItem.color);

    const title = document.createElement("h3");
    const meta = document.createElement("p");
    const reason = document.createElement("p");
    const checksTitle = document.createElement("strong");

    title.textContent = `${packageItem.code} — ${text(packageItem.name)}`;
    meta.className = "package-meta";
    meta.textContent = INFO_STRINGS[lang].range(packageItem.min, packageItem.max);
    reason.textContent = text(packageItem.reason);
    checksTitle.textContent = INFO_STRINGS[lang].coreChecks;

    const checks = packageItem.checks?.[lang] || packageItem.checks?.ar || [];
    card.append(title, meta, reason, checksTitle, createList(checks));
    container.append(card);
  });
}

function ruleGender(rule) {
  return INFO_STRINGS[lang][rule.gender] || INFO_STRINGS[lang].general;
}

function renderConditionalChecks() {
  const container = document.querySelector("#conditionalChecks");
  container.replaceChildren();

  config.conditionalChecks.forEach((rule) => {
    const card = document.createElement("article");
    const title = document.createElement("strong");
    const details = document.createElement("span");

    card.className = "conditional-card";
    title.textContent = text(rule.check);
    details.textContent = `${ruleGender(rule)} · ${INFO_STRINGS[lang].range(rule.minAge ?? 0, rule.maxAge ?? 75)}`;
    card.append(title, details);
    container.append(card);
  });
}

document.querySelector("#infoLangToggle").addEventListener("click", () => {
  localStorage.setItem("mirat_lang", lang === "ar" ? "en" : "ar");
  window.location.reload();
});

applyLanguage();
renderPackages();
renderConditionalChecks();
trackInfoView();
