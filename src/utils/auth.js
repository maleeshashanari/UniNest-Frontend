export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const getToken = () => localStorage.getItem("token");

export const isAdmin = () => getUser()?.role === "admin";

// Where should this user land after login?
export const homeFor = (user, from) => {
  if (user?.role === "admin") return "/admin";
  return from && !from.startsWith("/admin") ? from : "/home";
};

export const saveSession = ({ token, user }) => {
  if (token) localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("auth-changed"));
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-changed"));
};

export const isLoggedIn = () => Boolean(getToken());