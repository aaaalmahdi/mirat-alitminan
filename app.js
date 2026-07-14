const BOOT_VERSION = "20260714-v6";

function loadApplicationScript(filename) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `./${filename}?v=${BOOT_VERSION}`;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Unable to load ${filename}`));
    document.head.append(script);
  });
}

(async function bootstrap() {
  try {
    await loadApplicationScript("app-config.js");
    await loadApplicationScript("app-camera.js");
    await loadApplicationScript("app-main.js");
  } catch (error) {
    console.error("Application bootstrap failed.", error);
    const root = document.querySelector("#appRoot");
    if (root) {
      root.innerHTML = `
        <main class="fatal-card" role="alert">
          <h1>تعذر تشغيل التجربة</h1>
          <p>يرجى تحديث الصفحة أو استخدام صفحة معلومات الخدمة والباقات.</p>
          <a class="primary-btn linklike" href="./info.html">معلومات الخدمة والباقات</a>
        </main>`;
    }
  }
})();
