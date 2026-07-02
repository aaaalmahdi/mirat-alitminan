const screens = [...document.querySelectorAll(".screen")];
const video = document.querySelector("#cameraVideo");
const canvas = document.querySelector("#analysisCanvas");
const cameraStatus = document.querySelector("#cameraStatus");
const estimateBtn = document.querySelector("#estimateBtn");
const progressFill = document.querySelector("#progressFill");
const apparentAgeRange = document.querySelector("#apparentAgeRange");
const realInfoForm = document.querySelector("#realInfoForm");
const formError = document.querySelector("#formError");
const qualityBadge = document.querySelector("#qualityBadge");

let currentStream = null;
let modelsReady = false;
let cameraReady = false;
let lastApparentAge = null;
let qualityTimer = null;

const packageRules = [
  {
    min: 18,
    max: 39,
    name: "باقة الشباب",
    range: "18-39 سنة",
    type: "general",
    tags: ["أساسيات الصحة", "نمط الحياة", "وقاية مبكرة"],
    reason: "مناسبة للاطمئنان على المؤشرات الأساسية وبناء عادة فحص وقائية مبكرة.",
    checks: ["قياس الضغط", "مؤشرات السكر", "الدهون الأساسية", "كتلة الجسم", "إرشادات نمط الحياة"],
  },
  {
    min: 40,
    max: 44,
    name: "باقة الأربعينات 1",
    range: "40-44 سنة",
    type: "general",
    tags: ["ضغط وسكر", "دهون", "وقاية"],
    reason: "تركز على المؤشرات التي تبدأ أهميتها عادة في بداية الأربعينات.",
    checks: ["قياس الضغط", "فحص السكر", "دهون الدم", "تقييم الوزن", "مراجعة عوامل الخطورة"],
  },
  {
    min: 45,
    max: 49,
    name: "باقة الأربعينات 2",
    range: "45-49 سنة",
    type: "general",
    tags: ["متابعة أعمق", "قلب وسكر", "خطورة صحية"],
    reason: "مناسبة لتعزيز الكشف المبكر قبل الدخول في مرحلة الخمسينات.",
    checks: ["الضغط", "السكر التراكمي أو مؤشرات السكر", "دهون الدم", "مؤشرات القلب العامة", "نمط الحياة"],
  },
  {
    min: 50,
    max: 65,
    name: "باقة صحة الرجل",
    range: "50-65 سنة",
    type: "male",
    tags: ["صحة الرجل", "قلب وسكر", "متابعة دورية"],
    reason: "تركز على المؤشرات الوقائية المهمة للرجال في عمر 50 إلى 65 سنة.",
    checks: ["الضغط", "السكر", "دهون الدم", "مؤشرات القلب العامة", "استشارة الفحوصات المناسبة للرجل"],
  },
  {
    min: 50,
    max: 65,
    name: "باقة صحة المرأة",
    range: "50-65 سنة",
    type: "female",
    tags: ["صحة المرأة", "قلب وسكر", "متابعة دورية"],
    reason: "تركز على المؤشرات الوقائية المهمة للنساء في عمر 50 إلى 65 سنة.",
    checks: ["الضغط", "السكر", "دهون الدم", "مؤشرات القلب العامة", "استشارة الفحوصات المناسبة للمرأة"],
  },
  {
    min: 66,
    max: 75,
    name: "باقة العمر الذهبي",
    range: "66-75 سنة",
    type: "general",
    tags: ["متابعة شاملة", "اطمئنان", "جودة حياة"],
    reason: "مناسبة للمتابعة الوقائية المنتظمة ودعم جودة الحياة في العمر الذهبي.",
    checks: ["قياس الضغط", "مؤشرات السكر", "دهون الدم", "مراجعة عوامل الخطورة", "إرشادات المتابعة الدورية"],
  },
];

function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });
}

function stopCamera() {
  if (!currentStream) return;
  stopQualityMonitor();
  currentStream.getTracks().forEach((track) => track.stop());
  currentStream = null;
  cameraReady = false;
}

function setCameraStatus(message) {
  cameraStatus.textContent = message;
}

function setQuality(message, state = "neutral") {
  qualityBadge.textContent = message;
  qualityBadge.dataset.state = state;
}

async function loadModels() {
  if (modelsReady) return true;
  if (!window.faceapi) {
    setCameraStatus("تعذر تحميل مكتبة الذكاء. يمكنك المتابعة بدون كاميرا.");
    return false;
  }

  const modelSources = [
    "./models",
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights",
  ];

  for (const source of modelSources) {
    try {
      setCameraStatus("يتم تجهيز نموذج تقدير العمر...");
      await faceapi.nets.tinyFaceDetector.loadFromUri(source);
      await faceapi.nets.ageGenderNet.loadFromUri(source);
      modelsReady = true;
      return true;
    } catch (error) {
      console.warn(`Face model loading failed from ${source}:`, error);
    }
  }

  setCameraStatus("تعذر تحميل نموذج العمر. ستعمل التجربة بالمسار البديل.");
  return false;
}

async function startCamera() {
  showScreen("camera");
  estimateBtn.disabled = true;
  setCameraStatus("يتم طلب إذن الكاميرا...");

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera API unavailable");
    }

    currentStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 720 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    video.srcObject = currentStream;
    await video.play();
    cameraReady = true;
    const loaded = await loadModels();
    estimateBtn.disabled = false;
    if (loaded) {
      setCameraStatus("الكاميرا جاهزة. ضع وجهك داخل القلب ثم انتظر إشارة الوضوح.");
      startQualityMonitor();
    } else {
      setQuality("مسار ترفيهي بديل", "warning");
      setCameraStatus("الكاميرا جاهزة، لكن نموذج العمر غير متاح. سنعرض نتيجة ترفيهية بديلة.");
    }
  } catch (error) {
    console.warn("Camera failed:", error);
    setQuality("الكاميرا غير متاحة", "warning");
    setCameraStatus("لم نتمكن من فتح الكاميرا. يمكنك إدخال العمر الحقيقي ومعرفة الباقة مباشرة.");
  }
}

function manualAgeEstimate() {
  const values = [34, 35, 36, 37, 38];
  const selected = values[Math.floor(Math.random() * values.length)];
  return selected;
}

async function readAgeOnce() {
  if (!cameraReady || !modelsReady || !window.faceapi) {
    return manualAgeEstimate();
  }

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 224,
    scoreThreshold: 0.45,
  });

  const detection = await faceapi
    .detectSingleFace(video, options)
    .withAgeAndGender();

  if (!detection?.age) return null;
  return detection.age;
}

async function detectFaceQuality() {
  if (!cameraReady || !modelsReady || !window.faceapi) {
    return { ok: false, message: "المسار البديل جاهز", state: "warning" };
  }

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 224,
    scoreThreshold: 0.45,
  });
  const detection = await faceapi.detectSingleFace(video, options);

  if (!detection?.box) {
    return { ok: false, message: "لم يظهر الوجه بوضوح", state: "warning" };
  }

  const box = detection.box;
  const videoWidth = video.videoWidth || 1;
  const videoHeight = video.videoHeight || 1;
  const faceArea = (box.width * box.height) / (videoWidth * videoHeight);
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const centered =
    centerX > videoWidth * 0.25 &&
    centerX < videoWidth * 0.75 &&
    centerY > videoHeight * 0.2 &&
    centerY < videoHeight * 0.78;

  if (faceArea < 0.08) {
    return { ok: false, message: "قرب وجهك قليلاً", state: "warning" };
  }

  if (faceArea > 0.48) {
    return { ok: false, message: "ابتعد قليلاً", state: "warning" };
  }

  if (!centered) {
    return { ok: false, message: "ضع وجهك داخل القلب", state: "warning" };
  }

  return { ok: true, message: "الوجه واضح", state: "good" };
}

function startQualityMonitor() {
  stopQualityMonitor();
  setQuality("نبحث عن الوجه...", "neutral");
  qualityTimer = window.setInterval(async () => {
    try {
      const quality = await detectFaceQuality();
      setQuality(quality.message, quality.state);
    } catch (error) {
      console.warn("Face quality check failed:", error);
      setQuality("ضع وجهك داخل القلب", "neutral");
    }
  }, 900);
}

function stopQualityMonitor() {
  if (!qualityTimer) return;
  window.clearInterval(qualityTimer);
  qualityTimer = null;
}

function formatAgeRange(age) {
  const rounded = Math.round(age);
  const min = Math.max(18, rounded - 2);
  const max = Math.min(90, rounded + 2);
  return `${min}-${max}`;
}

async function estimateApparentAge() {
  if (cameraReady && modelsReady) {
    const quality = await detectFaceQuality();
    if (!quality.ok) {
      setQuality(quality.message, quality.state);
      setCameraStatus(`${quality.message} ثم حاول مرة أخرى.`);
      return;
    }
  }

  stopQualityMonitor();
  showScreen("processing");
  progressFill.style.width = "0%";

  const readings = [];
  const totalReads = 8;

  for (let i = 0; i < totalReads; i += 1) {
    const reading = await readAgeOnce();
    if (typeof reading === "number" && Number.isFinite(reading)) {
      readings.push(reading);
    }
    progressFill.style.width = `${Math.round(((i + 1) / totalReads) * 100)}%`;
    await new Promise((resolve) => setTimeout(resolve, 220));
  }

  if (!readings.length) {
    lastApparentAge = manualAgeEstimate();
  } else {
    const sorted = [...readings].sort((a, b) => a - b);
    const trimmed = sorted.length > 4 ? sorted.slice(1, -1) : sorted;
    lastApparentAge =
      trimmed.reduce((sum, value) => sum + value, 0) / trimmed.length;
  }

  apparentAgeRange.textContent = formatAgeRange(lastApparentAge);
  showScreen("apparent-result");
  stopCamera();
}

function findPackage(age, gender) {
  if (age < 18 || age > 75) return null;
  return packageRules.find((rule) => {
    const inRange = age >= rule.min && age <= rule.max;
    const genderMatch = rule.type === "general" || rule.type === gender;
    return inRange && genderMatch;
  });
}

function showPackage(rule) {
  document.querySelector("#packageName").textContent = rule.name;
  document.querySelector("#packageRange").textContent = rule.range;
  document.querySelector("#packageTagOne").textContent = rule.tags[0];
  document.querySelector("#packageTagTwo").textContent = rule.tags[1];
  document.querySelector("#packageTagThree").textContent = rule.tags[2];
  document.querySelector("#packageReason").textContent = rule.reason;

  const checks = document.querySelector("#packageChecks");
  checks.replaceChildren(
    ...rule.checks.map((check) => {
      const item = document.createElement("li");
      item.textContent = check;
      return item;
    }),
  );

  showScreen("package-result");
  stopCamera();
}

document.addEventListener("click", (event) => {
  const go = event.target.closest("[data-go]");
  const back = event.target.closest("[data-back]");

  if (go) {
    showScreen(go.dataset.go);
  }

  if (back) {
    showScreen(back.dataset.back);
  }
});

document.querySelector("#startCameraBtn").addEventListener("click", startCamera);
document.querySelector("#skipCameraBtn").addEventListener("click", () => {
  apparentAgeRange.textContent = "--";
  showScreen("real-info");
});
document.querySelector("#manualFromCameraBtn").addEventListener("click", () => {
  stopCamera();
  apparentAgeRange.textContent = "--";
  showScreen("real-info");
});
estimateBtn.addEventListener("click", estimateApparentAge);

realInfoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formError.textContent = "";

  const age = Number(document.querySelector("#realAge").value);
  const gender = new FormData(realInfoForm).get("gender");
  const result = findPackage(age, gender);

  if (!result) {
    formError.textContent = "الخدمة مخصصة للأعمار من 18 إلى 75 سنة.";
    return;
  }

  showPackage(result);
});

document.querySelector("#restartBtn").addEventListener("click", () => {
  realInfoForm.reset();
  formError.textContent = "";
  lastApparentAge = null;
  apparentAgeRange.textContent = "--";
  showScreen("welcome");
});

document.querySelector("#staffBtn").addEventListener("click", () => {
  alert("يرجى التوجه للموظف الموجود في البوث لمعرفة التفاصيل.");
});

window.addEventListener("pagehide", stopCamera);
