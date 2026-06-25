export const SUPPORT_EMAILS = [
  {
    organization: "Vidyashilp University",
    email: "admission@vidyashilp.edu.in",
  },
  {
    organization: "TechQRT",
    email: "info@techqrt.com",
  },
]

export const SUPPORT_EMAIL_LABELS = SUPPORT_EMAILS.map(
  (support) => `${support.organization}: ${support.email}`
)
