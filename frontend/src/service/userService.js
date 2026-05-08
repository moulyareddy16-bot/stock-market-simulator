import api from "./api";

// Fetch all users for Admin
export const getAllUsersForAdmin = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const toggleUserStatus = async (userId) => {
  const response = await api.patch(`/users/${userId}/toggle-status`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

export const getUserTransactionsForAdmin = async (userId) => {
  const response = await api.get(`/users/${userId}/transactions`);
  return response.data;
};

export const getUserPortfolioForAdmin = async (userId) => {
  const response = await api.get(`/users/${userId}/portfolio`);
  return response.data;
};
