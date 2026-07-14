window.MIRAT_APPROVAL = Object.freeze({
  releaseVersion: "20260714-v7",
  packageConfigVersion: "20260714-v6",
  approvedAt: "2026-07-14",
  approvedBy: "Abdulla",
  approverRole: "Project owner",
  organisation: Object.freeze({
    ar: "مراكز الرعاية الصحية الأولية",
    en: "Primary Healthcare Centres"
  }),
  product: Object.freeze({
    ar: "مرآة الاطمئنان",
    en: "Mirat Al-Itminan"
  }),
  status: Object.freeze({
    ar: "معتمد للاستخدام في المشروع",
    en: "Approved for project use"
  }),
  decision: Object.freeze({
    ar: "اعتماد جدول الباقات وقواعد الفحوصات الشرطية الحالية كما هي دون تعديل",
    en: "The current package table and conditional-screening rules are approved unchanged."
  }),
  emblem: "./assets/brand/primary-healthcare-centres-emblem.svg"
});

const approvalConfig = window.MIRAT_PACKAGE_CONFIG;
if (approvalConfig?.metadata) {
  approvalConfig.metadata.contentStatus = { ...window.MIRAT_APPROVAL.status };
  approvalConfig.metadata.lastUpdated = window.MIRAT_APPROVAL.approvedAt;
  approvalConfig.metadata.clinicalReviewDate = window.MIRAT_APPROVAL.approvedAt;
  approvalConfig.metadata.clinicalOwner = window.MIRAT_APPROVAL.approvedBy;
  approvalConfig.metadata.approvedBy = window.MIRAT_APPROVAL.approvedBy;
  approvalConfig.metadata.approvalDecision = { ...window.MIRAT_APPROVAL.decision };
}
