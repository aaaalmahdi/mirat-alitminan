(() => {
  const approval = window.MIRAT_APPROVAL;
  if (!approval) throw new Error("Approval metadata is unavailable.");

  INFO_COPY.en.brandName = approval.organisation.en;
  INFO_COPY.en.pilotLabel = approval.product.en;
  INFO_COPY.en.statusExplanation = "The current package table and conditional-screening rules are approved unchanged for project use. Final eligibility for each screening remains subject to the electronic health record and qualified staff verification.";
  INFO_COPY.en.faqFourQ = "Is the package table approved?";
  INFO_COPY.en.faqFourA = "Yes. The current package table and conditional-screening rules are approved unchanged for project use. This is not an individual eligibility decision; qualified staff confirm which screenings are due.";

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
    document.querySelector('[data-i18n="statusExplanation"]')?.replaceChildren(
      "تم اعتماد جدول الباقات وقواعد الفحوصات الشرطية الحالية كما هي دون تعديل. يظل الاستحقاق النهائي لكل فحص خاضعاً للملف الإلكتروني الصحي وتأكيد الموظف المختص."
    );
    document.querySelector('[data-i18n="faqFourQ"]')?.replaceChildren("هل جدول الباقات معتمد؟");
    document.querySelector('[data-i18n="faqFourA"]')?.replaceChildren(
      "نعم. تم اعتماد جدول الباقات وقواعد الفحوصات الشرطية الحالية كما هي للاستخدام في المشروع. لا يمثل ذلك قرار استحقاق فردياً؛ ويؤكد الموظف المختص الفحوصات المستحقة."
    );
  }

  applyLanguage();
})();
