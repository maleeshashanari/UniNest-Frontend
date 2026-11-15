import api from "./axios";

const BASE = "/feedback";

// Student
export const addFeedback = (data) => api.post(`${BASE}/add`, data).then((r) => r.data);
export const getMyFeedback = () => api.get(`${BASE}/my`).then((r) => r.data);
export const updateMyFeedback = (id, data) => api.put(`${BASE}/my/${id}`, data).then((r) => r.data);
export const deleteMyFeedback = (id) => api.delete(`${BASE}/my/${id}`).then((r) => r.data);
export const getAccommodationFeedback = (accommodationId) =>
  api.get(`${BASE}/accommodation/${accommodationId}`).then((r) => r.data);

// Admin
export const getAllFeedback = () => api.get(`${BASE}/all`).then((r) => r.data);
export const adminUpdateFeedback = (id, data) =>
  api.put(`${BASE}/admin/${id}`, data).then((r) => r.data);
export const adminDeleteFeedback = (id) => api.delete(`${BASE}/admin/${id}`).then((r) => r.data);
export const adminReplyFeedback = (id, adminReply) =>
  api.put(`${BASE}/admin/${id}/reply`, { adminReply }).then((r) => r.data);