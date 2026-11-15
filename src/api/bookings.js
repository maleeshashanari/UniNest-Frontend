import api from "./axios";

const BASE = "/bookings";

// Student
export const createBooking = (data) => api.post(BASE, data).then((r) => r.data);
export const getMyBookings = () => api.get(`${BASE}/my`).then((r) => r.data);
export const cancelMyBooking = (id) => api.put(`${BASE}/my/${id}/cancel`).then((r) => r.data);

// Admin
export const getAllBookings = () => api.get(`${BASE}/admin/all`).then((r) => r.data);
export const updateBookingStatus = (id, data) =>
  api.put(`${BASE}/admin/${id}/status`, data).then((r) => r.data);