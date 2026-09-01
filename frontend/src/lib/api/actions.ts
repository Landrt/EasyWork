/**
 * Frozen action identifiers. Must stay 1:1 with backend prompt §6.
 * Do not invent additional client action names.
 */
export const ACTIONS = {
  "AUTH.login": { method: "POST", path: "/auth/login" },
  "AUTH.register": { method: "POST", path: "/auth/register" },
  "AUTH.forgotPassword": { method: "POST", path: "/auth/forgot-password" },
  "AUTH.resetPassword": { method: "POST", path: "/auth/reset-password" },
  "AUTH.updateProfile": { method: "PATCH", path: "/auth/profile" },
  "AUTH.changePassword": { method: "POST", path: "/auth/change-password" },
  "ACCOUNT.exportData": { method: "POST", path: "/account/export" },
  "ACCOUNT.delete": { method: "DELETE", path: "/account" },
  "SUBSCRIPTION.checkout": { method: "POST", path: "/subscription/checkout" },
  "SUBSCRIPTION.cancel": { method: "POST", path: "/subscription/cancel" },
  "CV.create": { method: "POST", path: "/cvs" },
  "CV.update": { method: "PATCH", path: "/cvs" },
  "CV.delete": { method: "DELETE", path: "/cvs" },
  "CV.addSection": { method: "POST", path: "/cvs/sections" },
  "CV.removeSection": { method: "DELETE", path: "/cvs/sections" },
  "CV.reorderSections": { method: "PATCH", path: "/cvs/sections/order" },
  "CV.changeTemplate": { method: "POST", path: "/cvs/template" },
  "CV.export": { method: "POST", path: "/cvs/export" },
  "CV.import.upload": { method: "POST", path: "/cvs/import" },
  "PROFILE.update": { method: "PATCH", path: "/profile" },
  "PROFILE.confirm": { method: "POST", path: "/profile/confirm" },
  "QRO.answer": { method: "POST", path: "/qro/answer" },
  "QRO.addManualInfo": { method: "POST", path: "/qro/manual" },
  "QRO.complete": { method: "POST", path: "/qro/complete" },
  "QRO.start": { method: "POST", path: "/qro/start" },
  "JOB.analyze": { method: "POST", path: "/jobs/analyze" },
  "AI.optimize": { method: "POST", path: "/ai/optimize" },
  "AI.suggestion.accept": { method: "POST", path: "/ai/suggestions/accept" },
  "AI.suggestion.edit": { method: "POST", path: "/ai/suggestions/edit" },
  "AI.suggestion.reject": { method: "POST", path: "/ai/suggestions/reject" },
  "AI.suggestion.explain": { method: "GET", path: "/ai/suggestions/explain" },
  "AFFILIATE.getLink": { method: "GET", path: "/affiliate/link" },
  "AFFILIATE.getStats": { method: "GET", path: "/affiliate/stats" },
} as const;

export type ActionId = keyof typeof ACTIONS;

export type CheckoutTier = "sprint" | "monthly" | "founder";
