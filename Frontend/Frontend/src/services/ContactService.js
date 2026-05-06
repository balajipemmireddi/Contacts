import API from "../api/axios";

// Base URL is set in axios config (frontend.url env variable)

export const getAllContacts = async () => {
  const res = await API.get("/api/contacts");
  return res.data;
};

export const addContact = async (contact) => {
  const res = await API.post("/api/contacts", contact);
  return res.data;
};

export const updateContact = async (id, contact) => {
  const res = await API.put(`/api/contacts/${id}`, contact);
  return res.data;
};

export const deleteContact = async (id) => {
  await API.delete(`/api/contacts/${id}`);
};

export const toggleFavorite = async (id) => {
  const res = await API.patch(`/api/contacts/${id}/favorite`);
  return res.data;
};

export const searchContacts = async (query) => {
  const res = await API.get(`/api/contacts/search`, { params: { query } });
  return res.data;
};
