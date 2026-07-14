(() => {
  const approval = window.MIRAT_APPROVAL;
  if (!approval) throw new Error("Approval metadata is unavailable.");

  COPY.en.brandName = approval.organisation.en;
  COPY.en.pilotLabel = approval.product.en;
  COPY.en.pilotNoticeTitle = "Health notice";
  COPY.en.pilotNotice = "The current package table and conditional-screening rules are approved unchanged for this project. Final eligibility for each screening still depends on the electronic health record and qualified staff verification.";

  const emblem = document.querySelector(".brand-mark");
  if (emblem) {
    emblem.src = approval.emblem;
    emblem.classList.add("official-emblem");
    emblem.alt = lang === "ar" ? "شعار مملكة البحرين" : "Kingdom of Bahrain emblem";
    emblem.width = 58;
    emblem.height = 62;
  }

  const brandLink = document.querySelector(".brand-lockup");
  if (brandLink) {
    brandLink.setAttribute("aria-label", lang === "ar" ? approval.organisation.ar : approval.organisation.en);
  }

  if (lang === "ar") {
    document.querySelector('[data-i18n="brandName"]')?.replaceChildren(approval.organisation.ar);
    document.querySelector('[data-i18n="pilotLabel"]')?.replaceChildren(approval.product.ar);
    document.querySelector('[data-i18n="pilotNoticeTitle"]')?.replaceChildren("تنبيه صحي");
    document.querySelector('[data-i18n="pilotNotice"]')?.replaceChildren(
      "تم اعتماد جدول الباقات وقواعد الفحوصات الشرطية الحالية كما هي للاستخدام في المشروع. يظل الاستحقاق النهائي لكل فحص مرتبطاً بالملف الإلكتروني الصحي ويؤكده الموظف المختص."
    );
  }
})();
