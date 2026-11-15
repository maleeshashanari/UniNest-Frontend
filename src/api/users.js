import api from "./axios";

const BASE = "/users";

export const getAllStudents = () => api.get(`${BASE}/students`).then((r) => r.data);
export const getAllUsers = () => api.get(`${BASE}/all`).then((r) => r.data);

// backend toggles these, so only send the email
export const toggleBlockUser = (email) => api.put(`${BASE}/block`, { email }).then((r) => r.data);
export const changeUserRole = (email) => api.put(`${BASE}/change-role`, { email }).then((r) => r.data);