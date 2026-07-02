const screens = [...document.querySelectorAll(".screen")];
const video = document.querySelector("#cameraVideo");
const canvas = document.querySelector("#analysisCanvas");
const cameraStatus = document.querySelector("#cameraStatus");
const estimateBtn = document.querySelector("#estimateBtn");
const progressFill = document.querySelector("#progressFill");
const apparentAgeRange = document.querySelector("#apparentAgeRange");
const realInfoForm = document.querySelector("#realInfoForm");
const formError = document.querySelector("#formError");

let currentStream = null;
let modelsReady = false;
let cameraReady = false;
let lastApparentAge = null;

const packageRules = [
  { min: 18, max: 39, name: "باقة الشباب", range: "18-39 سنة", type: "general" },
  { min: 40, max: 44, name: "باقة الأربعينات 1", range: "40-44 سنة", type: "general" },
  { min: 45, max: 49, name: "باقة الأربعينات 2", range: "45-49 سنة", type: "general" },
  { min: 50, max: 65, name: "باقة صحة الرجل", range: "50-65 سنة", type: "male" },
  { min: 50, max: 65, name: "باقة صحة المرأة", range: "50-65 سنة", type: "female" },
  { min: 66, max: 75, name: "باقة العمر الذهبي", range: "66-75 سنة", type: "general" },
];

function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });
}

function stopCamera() {
  if (!currentStream) return;
  currentStream.getTracks().forEach((track) => track.stop());
  currentStream = null;
  cameraReady = false;
}

function setCameraStatus(message) {
  cameraStatus.textContent = message;
}

async function loadModels() {
  if (modelsReady) return true;
  if (!window.faceapi) {
    setCameraStatus("تعذر تحميل مكتبة الذكاء. يمكنك المتابعة بدون كاميرا.");
    return false;
  }

  try {
    setCameraStatus("يتم تجهيز نموذج تقدير العمر...");
    await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
    await faceapi.nets.ageGenderNet.loadFromUri("./models");
    modelsReady = true;
    return true;
  } catch (error) {
    setCameraStatus("تعذر تحميل نموذج العمر. ستعمل التجربة بالمسار البديل.");
    console.warn("Face model loading failed:", error);
    return false;
  }
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
    await loadModels();
    estimateBtn.disabled = false;
    setCameraStatus("الكاميرا جاهزة. ضع وجهك داخل القلب ثم اضغط الزر.");
  } catch (error) {
    console.warn("Camera failed:", error);
    setCameraStatus("لم نتمكن من فتح الكاميرا. يمكنك المتابعة بدون كاميرا.");
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

function formatAgeRange(age) {
  const rounded = Math.round(age);
  const min = Math.max(18, rounded - 2);
  const max = Math.min(90, rounded + 2);
  return `${min}-${max}`;
}

async function estimateApparentAge() {
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
    lastApparentAge =
      readings.reduce((sum, value) => sum + value, 0) / readings.length;
  }

  apparentAgeRange.textContent = formatAgeRange(lastApparentAge);
  showScreen("apparent-result");
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
