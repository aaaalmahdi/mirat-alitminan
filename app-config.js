const VERSION = "20260714-v6";
const FACE_API_SCRIPT = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
const MODEL_SOURCES = [
  "./models",
  "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights"
];

const FALLBACK = window.MIRAT_PACKAGE_CONFIG;
if (!FALLBACK || FALLBACK.version !== VERSION) {
  throw new Error("Package fallback configuration is missing or out of date.");
}

const COPY = {
  en: {
    skipToContent: "Skip to content",
    brandName: "Mirat Al-Itminan",
    pilotLabel: "Pilot version — awaiting official identity",
    service: "Early chronic disease screening",
    welcomeTitle: "Find your preventive package in a few simple steps",
    welcomeLead: "Enter your real age and gender for initial guidance. Apparent age is optional and for awareness only.",
    pilotNoticeTitle: "Important notice",
    pilotNotice: "This is a pilot version. The medical content is pending official review and approval.",
    startNow: "Start now",
    moreInfo: "Service and package information",
    slogan: "A simple step... for better health",
    choosePathEyebrow: "Choose a path",
    choosePathTitle: "How would you like to start?",
    fastestPath: "Fastest path",
    directPackage: "Find my package directly",
    directHint: "Use your real age and gender, without a camera.",
    optional: "Optional",
    cameraExperience: "Try apparent age first",
    cameraHint: "An awareness and entertainment experience only. It does not determine your package.",
    privacyEyebrow: "Your privacy matters",
    beforeCamera: "Before opening the camera",
    noSaveTitle: "No photo is saved",
    noSaveText: "The app processes the camera image on your device during the session. It does not upload it or save it to a database.",
    funOnlyTitle: "For awareness and entertainment only",
    funOnlyText: "Apparent age is not a medical assessment and does not affect package selection.",
    realAgeTitle: "Guidance uses real information",
    realAgeText: "Initial guidance uses real age and gender. Staff then verify final eligibility.",
    openCamera: "Agree and open camera",
    skipCamera: "Continue without camera",
    cameraTitle: "Place your face inside the heart",
    cameraLead: "Use good lighting and look directly at the camera.",
    cameraPreparing: "Preparing the experience...",
    cameraLoading: "Preparing the camera and model...",
    estimateAge: "Estimate apparent age",
    manualNoCamera: "Continue to package without camera",
    processingTitle: "Taking several readings",
    processingLead: "A few seconds for a more stable result...",
    funResult: "Non-medical interactive result",
    apparentTitle: "Approximate apparent age",
    years: "years",
    funOnlyShort: "For awareness and entertainment only.",
    decisionNotice: "This result is not a diagnosis and does not affect your package or eligibility.",
    next: "Next",
    realInfoEyebrow: "For initial guidance",
    realInfoTitle: "Your real information",
    realAge: "Real age",
    gender: "Gender",
    female: "Female",
    male: "Male",
    continueQuestions: "Next",
    optionalEyebrow: "Optional",
    questionsTitle: "3 questions to help staff",
    questionsLead: "These answers do not change the package. They help you prepare questions for staff.",
    questionsPrivacy: "Your answers are not stored in analytics. They are used only within this session to show an initial note.",
    qChronic: "Have you been diagnosed by a healthcare professional with diabetes, high blood pressure, or high lipids?",
    qRecent: "Have you had preventive screening in the last year?",
    qFamily: "Do you have a family history of chronic disease?",
    yes: "Yes",
    no: "No",
    unsure: "Not sure",
    showPackage: "Show my package",
    skipQuestions: "Skip questions",
    basedOn: "Based on real age and gender",
    yourPackage: "Your initial guidance package",
    recommendedChecks: "Suggested screenings for initial guidance",
    staffCard: "Show staff card",
    meaningTitle: "What does this mean for you?",
    priorityTitle: "A note to discuss with staff",
    guidanceTitle: "Quick guidance",
    aiExplain: "Explain my package",
    aiQuestion: "What should I ask staff?",
    aiNext: "What is the next step?",
    eligibilityNote: "Final eligibility depends on the electronic health record and previous screening dates and results, and is confirmed by qualified staff.",
    restart: "Restart",
    healthCard: "Health reassurance card",
    forStaff: "For staff review",
    ageLabel: "Age",
    genderLabel: "Gender",
    suggestedChecks: "Suggested screenings based on age and gender",
    staffNoteTitle: "Optional user notes",
    eligibilityNoteStaff: "All screenings are subject to eligibility and previous-result verification in the electronic health record.",
    done: "Done",
    newTest: "New test",
    thankTitle: "Thank you",
    thankLead: "Show the card to staff to verify which screenings are currently due.",
    analyticsTitle: "Device analytics",
    todayMetrics: "Today's metrics",
    totalMetrics: "Cumulative metrics on this device",
    packageCounts: "Packages shown today",
    dailySummary: "Today's summary",
    analyticsNote: "These figures are stored only on this device and do not include photos, names, personal identifiers, or individual ages.",
    clearAnalytics: "Clear local analytics",
    globalDisclaimer: "For awareness and initial guidance only; this experience is not a diagnosis or a final eligibility decision.",
    detailsLink: "Details",
    idleWarningTitle: "Are you still using the device?",
    idleWarningText: "The experience will restart automatically in",
    seconds: "seconds",
    continueSession: "Continue"
  }
};

const STRINGS = {
  ar: {
    lang: "English",
    back: "العودة إلى الشاشة السابقة",
    ageRequired: "يرجى إدخال العمر الحقيقي.",
    ageInvalid: "أدخل عمراً صحيحاً كاملاً من 18 إلى 75 سنة.",
    genderRequired: "يرجى اختيار الجنس.",
    packageUnavailable: "تعذر تحديد الباقة. يرجى مراجعة الموظف المختص.",
    cameraLoading: "نجهز الكاميرا والنموذج...",
    cameraReady: "الكاميرا جاهزة. ضع وجهك داخل القلب.",
    cameraFail: "تعذر فتح الكاميرا. يمكنك متابعة معرفة الباقة بدون كاميرا.",
    modelFail: "تعذر تحميل نموذج تقدير العمر. لن نعرض نتيجة بديلة أو عشوائية؛ يمكنك المتابعة بدون كاميرا.",
    estimateFail: "تعذر الحصول على قراءات كافية. حسّن الإضاءة أو تابع بدون كاميرا.",
    faceGood: "الوجه واضح",
    faceMissing: "لم يظهر الوجه بوضوح",
    faceNear: "قرّب وجهك قليلاً",
    faceFar: "ابتعد قليلاً",
    faceCenter: "ضع وجهك في منتصف القلب",
    oneFace: "يرجى ظهور وجه واحد فقط",
    tryAgain: "ثم حاول مرة أخرى.",
    female: "أنثى",
    male: "ذكر",
    yes: "نعم",
    no: "لا",
    unsure: "غير متأكد",
    cleared: "تم مسح الإحصاءات المحلية.",
    clearPrompt: "اكتب كلمة «مسح» لتأكيد حذف الإحصاءات المحلية من هذا الجهاز.",
    noRisk: "لا توجد ملاحظات اختيارية مسجلة.",
    eligibility: "الاستحقاق النهائي يعتمد على الملف الإلكتروني الصحي وتاريخ ونتائج الفحوصات السابقة، ويؤكده الموظف المختص.",
    analyticsEmpty: "لا توجد بيانات كافية اليوم.",
    adminDisabled: "لوحة الإدارة متاحة فقط عند فتح الصفحة باستخدام ?admin=1.",
    metrics: {
      visits: "الزيارات",
      starts: "بدأ التجربة",
      direct: "المسار المباشر",
      cameraPath: "مسار الكاميرا",
      cameraOpen: "فتح الكاميرا",
      cameraFail: "فشل الكاميرا",
      cameraModelFail: "فشل نموذج العمر",
      ageEstimates: "نتائج العمر الظاهري",
      ageEstimateFail: "فشل التقدير",
      completed: "نتائج مكتملة",
      staffCards: "بطاقات الموظف",
      infoClicks: "نقر رابط المعلومات",
      infoViews: "فتح صفحة المعلومات",
      completionRate: "نسبة الإكمال"
    }
  },
  en: {
    lang: "العربية",
    back: "Go back to the previous screen",
    ageRequired: "Enter your real age.",
    ageInvalid: "Enter a whole-number age from 18 to 75.",
    genderRequired: "Select your gender.",
    packageUnavailable: "The package could not be determined. Please ask a qualified staff member.",
    cameraLoading: "Preparing the camera and model...",
    cameraReady: "Camera ready. Place your face inside the heart.",
    cameraFail: "The camera could not be opened. You can continue without it.",
    modelFail: "The age-estimation model could not be loaded. No replacement or random result will be shown; you can continue without the camera.",
    estimateFail: "Not enough valid readings were obtained. Improve the lighting or continue without the camera.",
    faceGood: "Face is clear",
    faceMissing: "Face is not clear",
    faceNear: "Move a little closer",
    faceFar: "Move back slightly",
    faceCenter: "Center your face inside the heart",
    oneFace: "Only one face should be visible",
    tryAgain: "then try again.",
    female: "Female",
    male: "Male",
    yes: "Yes",
    no: "No",
    unsure: "Not sure",
    cleared: "Local analytics were cleared.",
    clearPrompt: "Type CLEAR to remove local analytics from this device.",
    noRisk: "No optional notes were recorded.",
    eligibility: "Final eligibility depends on the electronic health record and previous screening dates and results, and is confirmed by qualified staff.",
    analyticsEmpty: "There is not enough data today.",
    adminDisabled: "The admin panel is available only when the page is opened with ?admin=1.",
    metrics: {
      visits: "Visits",
      starts: "Started",
      direct: "Direct path",
      cameraPath: "Camera path",
      cameraOpen: "Camera opened",
      cameraFail: "Camera failures",
      cameraModelFail: "Model failures",
      ageEstimates: "Apparent-age results",
      ageEstimateFail: "Estimate failures",
      completed: "Completed results",
      staffCards: "Staff cards",
      infoClicks: "Information-link clicks",
      infoViews: "Information-page views",
      completionRate: "Completion rate"
    }
  }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const params = new URLSearchParams(window.location.search);
const KIOSK_MODE = params.get("mode") === "kiosk";
const ADMIN_MODE = params.get("admin") === "1";
const ANALYTICS_KEY = "mirat_analytics";
const IDLE_TIMEOUT_MS = 120000;
const IDLE_WARNING_SECONDS = 15;

let lang = localStorage.getItem("mirat_lang") === "en" ? "en" : "ar";
let packages = FALLBACK.packages;
let conditionalChecks = FALLBACK.conditionalChecks;
let stream = null;
let modelsReady = false;
let cameraReady = false;
let cameraSessionToken = 0;
let qualityTimer = null;
let faceCheckBusy = false;
let idleTimer = null;
let idleCountdownTimer = null;
let idleSeconds = IDLE_WARNING_SECONDS;
let adminTaps = 0;
let pending = { age: null, gender: null };
let answers = {};
let lastResult = null;

function t(key) {
  return STRINGS[lang][key] ?? key;
}

function localized(value) {
  return value?.[lang] ?? value?.ar ?? value?.en ?? "";
}

function applyLanguage() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.title = lang === "ar" ? "مرآة الاطمئنان" : "Mirat Al-Itminan";

  if (lang === "en") {
    $$(`[data-i18n]`).forEach((element) => {
      const translated = COPY.en[element.dataset.i18n];
      if (translated) element.textContent = translated;
    });
  }

  $$(`[data-i18n-aria]`).forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });

  $("#langToggle").textContent = t("lang");
  $("#realAge").setAttribute("placeholder", lang === "ar" ? "أدخل عمرك" : "Enter your age");
  $("#cameraVideo").setAttribute("aria-label", lang === "ar" ? "معاينة الكاميرا الأمامية" : "Front camera preview");
  $("#adminTap").setAttribute("aria-label", lang === "ar" ? "فتح لوحة قياس الجهاز" : "Open device analytics");
}

function validConfig(config) {
  return Boolean(
    config &&
    config.version === VERSION &&
    Array.isArray(config.packages) &&
    config.packages.length &&
    Array.isArray(config.conditionalChecks)
  );
}

async function loadPackages() {
  try {
    const response = await fetch(`./packages.json?v=${VERSION}`, { cache: "no-store" });
    if (!response.ok) return;
    const config = await response.json();
    if (validConfig(config)) {
      packages = config.packages;
      conditionalChecks = config.conditionalChecks;
    }
  } catch (error) {
    console.warn("Using local package fallback.", error);
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
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

function analyticsData() {
  try {
    return normalizeAnalytics(JSON.parse(localStorage.getItem(ANALYTICS_KEY) || "{}"));
  } catch {
    return normalizeAnalytics({});
  }
}

function saveAnalytics(value) {
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(value));
}

function incrementBucket(bucket, key, packageCode) {
  bucket[key] = (bucket[key] || 0) + 1;
  if (packageCode) {
    bucket.packages = bucket.packages || {};
    bucket.packages[packageCode] = (bucket.packages[packageCode] || 0) + 1;
  }
}

function track(key, packageCode) {
  const analytics = analyticsData();
  const day = todayKey();
  analytics.days[day] = analytics.days[day] || emptyBucket();
  incrementBucket(analytics.totals, key, packageCode);
  incrementBucket(analytics.days[day], key, packageCode);
  saveAnalytics(analytics);
}

function activeScreenName() {
  return $(".screen.active")?.dataset.screen || "welcome";
}

function show(screenName, options = {}) {
  const { focus = true } = options;

  $$(".screen").forEach((screen) => {
    const active = screen.dataset.screen === screenName;
    screen.classList.toggle("active", active);
    screen.hidden = !active;
    screen.setAttribute("aria-hidden", String(!active));
    if (active) {
      screen.id = "activeScreen";
    } else if (screen.id === "activeScreen") {
      screen.removeAttribute("id");
    }
  });

  if (screenName === "analytics") renderStats();
  resetIdle();

  if (focus) {
    requestAnimationFrame(() => {
      const title = $(".screen.active .screen-title");
      title?.focus({ preventScroll: true });
    });
  }
}

function setQuality(message, state = "neutral") {
  const badge = $("#qualityBadge");
  badge.textContent = message;
  badge.dataset.state = state;
}

function setStatus(message) {
  $("#cameraStatus").textContent = message;
}

function stopCamera() {
  cameraSessionToken += 1;
  clearInterval(qualityTimer);
  qualityTimer = null;
  faceCheckBusy = false;
  if (stream) {
    stream.getTracks().forEach((trackItem) => trackItem.stop());
    stream = null;
  }
  cameraReady = false;
  const video = $("#cameraVideo");
  if (video) video.srcObject = null;
}
