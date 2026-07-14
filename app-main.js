function matchingPackages(age, gender) {
  return packages.filter((item) => (
    age >= item.min &&
    age <= item.max &&
    (item.gender === "general" || item.gender === gender)
  ));
}

function pickPackage(age, gender) {
  const matches = matchingPackages(age, gender);
  return matches.length === 1 ? matches[0] : null;
}

function packageChecks(packageItem, age, gender) {
  const base = packageItem.checks?.[lang] || packageItem.checks?.ar || [];
  const result = [...base];

  conditionalChecks.forEach((rule) => {
    const minimum = rule.minAge ?? 0;
    const maximum = rule.maxAge ?? 999;
    const genderMatches = rule.gender === "general" || rule.gender === gender;
    if (age >= minimum && age <= maximum && genderMatches) {
      result.push(localized(rule.check));
    }
  });

  return [...new Set(result.filter(Boolean))];
}

function renderList(element, items) {
  element.replaceChildren(...items.map((item) => {
    const row = document.createElement("li");
    row.textContent = item;
    return row;
  }));
}

function answerNote() {
  const notes = [];

  if (answers.chronic === "yes") {
    notes.push(lang === "ar"
      ? "ذكر وجود تشخيص سابق بالسكري أو ارتفاع الضغط أو الدهون؛ يُفضّل مراجعة أولوية الفحوصات مع الموظف."
      : "Reported a previous diagnosis of diabetes, high blood pressure, or high lipids; review screening priority with staff.");
  } else if (answers.chronic === "unsure") {
    notes.push(lang === "ar"
      ? "غير متأكد من وجود تشخيص سابق؛ يُفضّل التحقق من الملف الإلكتروني الصحي."
      : "Not sure about a previous diagnosis; check the electronic health record.");
  }

  if (answers.recent === "no") {
    notes.push(lang === "ar"
      ? "لم يجر فحصاً وقائياً خلال آخر سنة؛ يُرجى التحقق من الفحوصات المستحقة."
      : "No preventive screening in the last year; verify which screenings are due.");
  } else if (answers.recent === "unsure") {
    notes.push(lang === "ar"
      ? "غير متأكد من تاريخ آخر فحص وقائي؛ يُرجى مراجعته مع الموظف."
      : "Not sure when the last preventive screening occurred; review it with staff.");
  }

  if (answers.family === "yes") {
    notes.push(lang === "ar"
      ? "ذكر وجود تاريخ عائلي؛ يُفضّل سؤال الموظف عما إذا كان يؤثر على أولوية الفحص."
      : "Reported a family history; ask staff whether it affects screening priority.");
  } else if (answers.family === "unsure") {
    notes.push(lang === "ar"
      ? "غير متأكد من التاريخ العائلي؛ يمكن مناقشة ذلك مع الموظف."
      : "Not sure about family history; this can be discussed with staff.");
  }

  return notes.length ? notes.join(" ") : t("noRisk");
}

function guidanceText(kind) {
  if (!lastResult) return "";
  const packageItem = lastResult.packageItem;

  if (kind === "question") {
    return lang === "ar"
      ? `اسأل الموظف: ما الفحوصات المستحقة الآن؟ وما تاريخ آخر فحص مسجل؟ ${t("eligibility")}`
      : `Ask staff: Which screenings are currently due, and when was my last recorded screening? ${t("eligibility")}`;
  }

  if (kind === "next") {
    return `${localized(packageItem.nextStep)} ${t("eligibility")}`;
  }

  return `${localized(packageItem.meaning)} ${t("eligibility")}`;
}

function showPackage(packageItem, age, gender) {
  const checks = packageChecks(packageItem, age, gender);
  lastResult = { packageItem, age, gender, checks, answers: { ...answers } };

  $("#packageCard").style.setProperty("--pkg", packageItem.color);
  $("#packageCode").textContent = packageItem.code;
  $("#packageName").textContent = localized(packageItem.name);
  $("#packageRange").textContent = localized(packageItem.range);

  const tags = packageItem.tags?.[lang] || packageItem.tags?.ar || [];
  $("#packageTagOne").textContent = tags[0] || "";
  $("#packageTagTwo").textContent = tags[1] || "";
  $("#packageTagThree").textContent = tags[2] || "";

  $("#packageReason").textContent = localized(packageItem.reason);
  $("#packageMeaning").textContent = localized(packageItem.meaning);
  $("#priorityNote").textContent = answerNote();
  $("#aiAnswer").textContent = guidanceText("explain");
  renderList($("#packageChecks"), checks);

  track("completed", packageItem.code);
  stopCamera();
  show("package-result");
}

function completeFromPending() {
  const packageItem = pickPackage(pending.age, pending.gender);
  if (!packageItem) {
    show("real-info", { focus: false });
    showFormError(t("packageUnavailable"));
    return;
  }
  showPackage(packageItem, pending.age, pending.gender);
}

function showFormError(message, field) {
  const error = $("#formError");
  error.textContent = message;
  $("#realAge").removeAttribute("aria-invalid");

  if (field === "age") {
    $("#realAge").setAttribute("aria-invalid", "true");
    $("#realAge").focus();
  } else if (field === "gender") {
    document.querySelector('input[name="gender"]')?.focus();
  }
}

function showStaffCard() {
  if (!lastResult) return;

  const { packageItem, age, gender, checks } = lastResult;
  if (!["female", "male"].includes(gender)) return;

  $("#staffCard").style.setProperty("--pkg", packageItem.color);
  $("#staffPackageCode").textContent = packageItem.code;
  $("#staffPackageName").textContent = localized(packageItem.name);
  $("#staffPackageRange").textContent = localized(packageItem.range);
  $("#staffAge").textContent = lang === "ar" ? `${age} سنة` : `${age} years`;
  $("#staffGender").textContent = gender === "female" ? t("female") : t("male");
  $("#staffRiskNote").textContent = answerNote();
  renderList($("#staffChecks"), checks);

  track("staffCards");
  show("staff-card");
}

function metricCards(bucket) {
  const started = bucket.starts || 0;
  const completed = bucket.completed || 0;
  const completionRate = started ? Math.round((completed / started) * 100) : 0;
  const keys = [
    "visits",
    "starts",
    "direct",
    "cameraPath",
    "cameraOpen",
    "cameraFail",
    "cameraModelFail",
    "ageEstimates",
    "ageEstimateFail",
    "completed",
    "staffCards",
    "infoClicks",
    "infoViews"
  ];

  return [
    ...keys.map((key) => [t("metrics")[key], bucket[key] || 0]),
    [t("metrics").completionRate, `${completionRate}%`]
  ];
}

function renderMetricGrid(element, bucket) {
  element.replaceChildren(...metricCards(bucket).map(([label, value]) => {
    const card = document.createElement("div");
    card.className = "analytics-card";
    const strong = document.createElement("strong");
    const span = document.createElement("span");
    strong.textContent = value;
    span.textContent = label;
    card.append(strong, span);
    return card;
  }));
}

function renderStats() {
  const analytics = analyticsData();
  const today = analytics.days[todayKey()] || emptyBucket();

  renderMetricGrid($("#analyticsTodayGrid"), today);
  renderMetricGrid($("#analyticsTotalGrid"), analytics.totals);

  const packageCounts = today.packages || {};
  const packageRows = Object.keys(packageCounts)
    .sort()
    .map((code) => `${code}: ${packageCounts[code]}`);
  renderList($("#analyticsPackages"), packageRows.length ? packageRows : [t("analyticsEmpty")]);

  const started = today.starts || 0;
  const completed = today.completed || 0;
  const completionRate = started ? Math.round((completed / started) * 100) : 0;
  const topPackage = Object.keys(packageCounts).sort((a, b) => packageCounts[b] - packageCounts[a])[0];

  $("#analyticsSummary").textContent = topPackage
    ? (lang === "ar"
      ? `أكثر باقة ظهرت اليوم: ${topPackage}. نسبة الإكمال: ${completionRate}%. المسار المباشر: ${today.direct || 0}. مسار الكاميرا: ${today.cameraPath || 0}.`
      : `Most-shown package today: ${topPackage}. Completion rate: ${completionRate}%. Direct path: ${today.direct || 0}. Camera path: ${today.cameraPath || 0}.`)
    : t("analyticsEmpty");
}

function hideIdleWarning() {
  clearInterval(idleCountdownTimer);
  idleCountdownTimer = null;
  $("#idleWarning").hidden = true;
}

function showIdleWarning() {
  idleSeconds = IDLE_WARNING_SECONDS;
  $("#idleCountdown").textContent = String(idleSeconds);
  $("#idleWarning").hidden = false;
  $("#idleWarningTitle").focus();

  idleCountdownTimer = setInterval(() => {
    idleSeconds -= 1;
    $("#idleCountdown").textContent = String(idleSeconds);
    if (idleSeconds <= 0) {
      hideIdleWarning();
      restart();
    }
  }, 1000);
}

function resetIdle() {
  if (!KIOSK_MODE) return;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(showIdleWarning, IDLE_TIMEOUT_MS);
}

function continueSession() {
  hideIdleWarning();
  resetIdle();
  $(".screen.active .screen-title")?.focus();
}

function directPath() {
  stopCamera();
  track("direct");
  show("real-info");
}

function restart() {
  stopCamera();
  hideIdleWarning();
  lastResult = null;
  pending = { age: null, gender: null };
  answers = {};

  $("#realInfoForm").reset();
  $("#riskForm").reset();
  $("#formError").textContent = "";
  $("#realAge").removeAttribute("aria-invalid");
  $("#apparentAgeRange").textContent = "--";
  $("#progressFill").style.width = "0%";

  show("welcome");
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const go = event.target.closest("[data-go]");
    const back = event.target.closest("[data-back]");
    const guidance = event.target.closest("[data-ai]");

    if (go) show(go.dataset.go);
    if (back) {
      stopCamera();
      show(back.dataset.back);
    }
    if (guidance) {
      $("#aiAnswer").textContent = guidanceText(guidance.dataset.ai);
    }
  });

  ["click", "touchstart", "keydown"].forEach((eventName) => {
    document.addEventListener(eventName, () => {
      if (!$("#idleWarning").hidden) hideIdleWarning();
      resetIdle();
    }, { passive: true });
  });

  $("#startExperienceBtn").addEventListener("click", () => {
    track("starts");
    show("path-choice");
  });
  $("#infoLink").addEventListener("click", () => track("infoClicks"));
  $("#directPackageBtn").addEventListener("click", directPath);
  $("#cameraPathBtn").addEventListener("click", () => {
    track("cameraPath");
    show("consent");
  });
  $("#skipCameraBtn").addEventListener("click", directPath);
  $("#manualFromCameraBtn").addEventListener("click", directPath);
  $("#openCameraBtn").addEventListener("click", openCamera);
  $("#estimateBtn").addEventListener("click", estimateApparentAge);
  $("#showStaffCardBtn").addEventListener("click", showStaffCard);
  $("#restartBtn").addEventListener("click", restart);
  $("#staffCardRestartBtn").addEventListener("click", restart);
  $("#doneBtn").addEventListener("click", () => show("thank-you"));
  $("#thankRestartBtn").addEventListener("click", restart);
  $("#continueSessionBtn").addEventListener("click", continueSession);

  $("#skipQuestionsBtn").addEventListener("click", () => {
    answers = {};
    completeFromPending();
  });

  $("#langToggle").addEventListener("click", () => {
    localStorage.setItem("mirat_lang", lang === "ar" ? "en" : "ar");
    window.location.reload();
  });

  if (ADMIN_MODE) {
    $("#adminTap").hidden = false;
    $("#adminTap").addEventListener("click", () => {
      adminTaps += 1;
      window.setTimeout(() => { adminTaps = 0; }, 1400);
      if (adminTaps >= 5) {
        adminTaps = 0;
        show("analytics");
      }
    });
  }

  $("#clearAnalyticsBtn").addEventListener("click", () => {
    const confirmation = window.prompt(t("clearPrompt"));
    const expected = lang === "ar" ? "مسح" : "CLEAR";
    if (confirmation !== expected) return;
    localStorage.removeItem(ANALYTICS_KEY);
    renderStats();
    window.alert(t("cleared"));
  });

  $("#realInfoForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const ageValue = $("#realAge").value.trim();
    const gender = new FormData(event.currentTarget).get("gender");
    $("#formError").textContent = "";
    $("#realAge").removeAttribute("aria-invalid");

    if (!ageValue) {
      showFormError(t("ageRequired"), "age");
      return;
    }

    const age = Number(ageValue);
    if (!Number.isInteger(age) || age < 18 || age > 75) {
      showFormError(t("ageInvalid"), "age");
      return;
    }

    if (!["female", "male"].includes(gender)) {
      showFormError(t("genderRequired"), "gender");
      return;
    }

    const packageItem = pickPackage(age, gender);
    if (!packageItem) {
      showFormError(t("packageUnavailable"));
      return;
    }

    pending = { age, gender };
    show("questions");
  });

  $("#riskForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    answers = {
      chronic: form.get("chronic") || "",
      recent: form.get("recent") || "",
      family: form.get("family") || ""
    };
    completeFromPending();
  });
}

window.addEventListener("pagehide", stopCamera);
document.addEventListener("visibilitychange", () => {
  if (document.hidden && cameraReady) {
    stopCamera();
    show("consent", { focus: false });
  }
});

(async function init() {
  applyLanguage();
  await loadPackages();
  bindEvents();
  track("visits");
  show("welcome", { focus: false });
  resetIdle();
})();
