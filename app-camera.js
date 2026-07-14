function loadFaceApiScript() {
  if (window.faceapi) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-face-api="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.faceapi)), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = FACE_API_SCRIPT;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.faceApi = "true";
    script.onload = () => resolve(Boolean(window.faceapi));
    script.onerror = () => resolve(false);
    document.head.append(script);
  });
}

async function loadModels() {
  if (modelsReady) return true;
  const scriptReady = await loadFaceApiScript();
  if (!scriptReady || !window.faceapi) return false;

  for (const source of MODEL_SOURCES) {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(source),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(source),
        faceapi.nets.ageGenderNet.loadFromUri(source)
      ]);
      modelsReady = true;
      return true;
    } catch (error) {
      console.warn(`Model source failed: ${source}`, error);
    }
  }
  return false;
}

function cameraUnavailable(message, metric) {
  if (metric) track(metric);
  stopCamera();
  $("#estimateBtn").disabled = true;
  setQuality(message, "warning");
  setStatus(message);
}

async function openCamera() {
  track("cameraOpen");
  stopCamera();
  const sessionToken = cameraSessionToken;
  show("camera");
  $("#estimateBtn").disabled = true;
  setQuality(lang === "ar" ? "نجهز التجربة..." : "Preparing...", "neutral");
  setStatus(t("cameraLoading"));

  if (!navigator.mediaDevices?.getUserMedia) {
    cameraUnavailable(t("cameraFail"), "cameraFail");
    return;
  }

  try {
    const [mediaStream, modelStatus] = await Promise.all([
      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 720 },
          height: { ideal: 720 }
        },
        audio: false
      }),
      loadModels()
    ]);

    if (sessionToken !== cameraSessionToken) {
      mediaStream.getTracks().forEach((trackItem) => trackItem.stop());
      return;
    }

    stream = mediaStream;

    if (!modelStatus) {
      cameraUnavailable(t("modelFail"), "cameraModelFail");
      return;
    }

    const video = $("#cameraVideo");
    video.srcObject = stream;
    await video.play();
    cameraReady = true;
    $("#estimateBtn").disabled = false;
    setStatus(t("cameraReady"));
    watchFace();
  } catch (error) {
    console.warn("Camera unavailable.", error);
    cameraUnavailable(t("cameraFail"), "cameraFail");
  }
}

function detectorOptions() {
  return new faceapi.TinyFaceDetectorOptions({
    inputSize: 224,
    scoreThreshold: 0.45
  });
}

async function faceQuality() {
  if (!cameraReady || !modelsReady || !window.faceapi) {
    return { ok: false, message: t("modelFail"), state: "warning" };
  }

  const faces = await faceapi.detectAllFaces($("#cameraVideo"), detectorOptions());
  if (!faces.length) return { ok: false, message: t("faceMissing"), state: "warning" };
  if (faces.length > 1) return { ok: false, message: t("oneFace"), state: "warning" };

  const box = faces[0].box;
  const video = $("#cameraVideo");
  const width = video.videoWidth || 1;
  const height = video.videoHeight || 1;
  const area = (box.width * box.height) / (width * height);
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  if (area < 0.08) return { ok: false, message: t("faceNear"), state: "warning" };
  if (area > 0.48) return { ok: false, message: t("faceFar"), state: "warning" };
  if (centerX < width * 0.25 || centerX > width * 0.75 || centerY < height * 0.2 || centerY > height * 0.78) {
    return { ok: false, message: t("faceCenter"), state: "warning" };
  }
  return { ok: true, message: t("faceGood"), state: "good" };
}

function watchFace() {
  setQuality(lang === "ar" ? "نبحث عن الوجه..." : "Looking for a face...");
  qualityTimer = setInterval(async () => {
    if (faceCheckBusy) return;
    faceCheckBusy = true;
    try {
      const result = await faceQuality();
      setQuality(result.message, result.state);
    } catch {
      setQuality(t("faceCenter"), "warning");
    } finally {
      faceCheckBusy = false;
    }
  }, 900);
}

async function readApparentAge() {
  if (!cameraReady || !modelsReady || !window.faceapi) return null;

  try {
    const detection = await faceapi
      .detectSingleFace($("#cameraVideo"), detectorOptions())
      .withFaceLandmarks(true)
      .withAgeAndGender();
    return Number.isFinite(detection?.age) ? detection.age : null;
  } catch {
    return null;
  }
}

async function estimateApparentAge() {
  if (!cameraReady || !modelsReady) {
    cameraUnavailable(t("modelFail"));
    return;
  }

  const quality = await faceQuality();
  if (!quality.ok) {
    setQuality(quality.message, quality.state);
    setStatus(`${quality.message} ${t("tryAgain")}`);
    return;
  }

  clearInterval(qualityTimer);
  qualityTimer = null;
  show("processing");
  const progress = $(".progress-track");
  const fill = $("#progressFill");
  fill.style.width = "0%";
  progress.setAttribute("aria-valuenow", "0");

  const readings = [];
  for (let index = 0; index < 8; index += 1) {
    const reading = await readApparentAge();
    if (Number.isFinite(reading)) readings.push(reading);

    const percent = Math.round((index + 1) * 12.5);
    fill.style.width = `${percent}%`;
    progress.setAttribute("aria-valuenow", String(percent));
    await new Promise((resolve) => setTimeout(resolve, 170));
  }

  if (readings.length < 3) {
    track("ageEstimateFail");
    show("camera");
    setQuality(t("estimateFail"), "warning");
    setStatus(t("estimateFail"));
    watchFace();
    return;
  }

  const sorted = [...readings].sort((a, b) => a - b);
  const stable = sorted.length > 4 ? sorted.slice(1, -1) : sorted;
  const average = stable.reduce((sum, value) => sum + value, 0) / stable.length;
  const rounded = Math.round(average);

  $("#apparentAgeRange").textContent = `${Math.max(18, rounded - 2)}–${Math.min(90, rounded + 2)}`;
  track("ageEstimates");
  stopCamera();
  show("apparent-result");
}
