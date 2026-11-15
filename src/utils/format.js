export const formatLKR = (n) => `Rs. ${Number(n || 0).toLocaleString("en-US")}`;

export const isRealImage = (s) => /^https?:\/\//i.test(s || "");

export const coverImage = (images) => (images || []).find(isRealImage) || "";

export const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "–";