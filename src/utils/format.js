export const formatLKR = (n) => `Rs. ${Number(n || 0).toLocaleString("en-US")}`;

export const isRealImage = (s) => /^https?:\/\//i.test(s || "");

export const coverImage = (images) => (images || []).find(isRealImage) || "";