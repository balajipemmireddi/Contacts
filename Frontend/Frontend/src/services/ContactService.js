import API from "../api/axios";

// Base URL is set in axios config (VITE_API_URL includes /api)

export const getAllContacts = async () => {
  const res = await API.get("/contacts"); // Removed extra /api
  return res.data;
};

export const addContact = async (contact) => {
  const res = await API.post("/contacts", contact); // Removed extra /api
  return res.data;
};

export const updateContact = async (id, contact) => {
  const res = await API.put(`/contacts/${id}`, contact); // Removed extra /api
  return res.data;
};

export const deleteContact = async (id) => {
  await API.delete(`/contacts/${id}`); // Removed extra /api
};

export const toggleFavorite = async (id) => {
  const res = await API.patch(`/contacts/${id}/favorite`); // Removed extra /api
  return res.data;
};

export const searchContacts = async (query) => {
  const res = await API.get(`/contacts/search`, { params: { query } }); // Removed extra /api
  return res.data;
};
