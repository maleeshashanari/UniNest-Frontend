export const passwordRules = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Lowercase", test: (p) => /[a-z]/.test(p) },
  { label: "Uppercase", test: (p) => /[A-Z]/.test(p) },
  { label: "Number", test: (p) => /\d/.test(p) },
  { label: "Special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];