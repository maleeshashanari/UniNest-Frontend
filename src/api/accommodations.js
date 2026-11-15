import api from "./axios";

const BASE = "/accommodations";

export const getPublicAccommodations = () => api.get(`${BASE}/public`).then((r) => r.data);
export const getAllAccommodations = () => api.get(`${BASE}/all`).then((r) => r.data);
export const getAccommodation = (id) => api.get(`${BASE}/${id}`).then((r) => r.data);
export const addAccommodation = (data) => api.post(`${BASE}/add`, data).then((r) => r.data);
export const updateAccommodation = (id, data) =>
  api.put(`${BASE}/${id}/update`, data).then((r) => r.data);
export const deleteAccommodation = (id) => api.delete(`${BASE}/${id}/delete`).then((r) => r.data);