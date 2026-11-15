import api from "./axios";

const BASE = "/contact";

// Student
export const submitContactMessage = (data) => api.post(BASE, data).then((r) => r.data);
export const getMyContactMessages = () => api.get(`${BASE}/my`).then((r) => r.data);

// Admin
export const getAllContactMessages = () => api.get(`${BASE}/admin/all`).then((r) => r.data);
export const updateContactStatus = (id, status) =>
  api.put(`${BASE}/admin/${id}/status`, { status }).then((r) => r.data);
export const replyToContactMessage = (id, adminReply) =>
  api.put(`${BASE}/admin/${id}/reply`, { adminReply }).then((r) => r.data);
export const deleteContactMessage = (id) => api.delete(`${BASE}/admin/${id}`).then((r) => r.data);