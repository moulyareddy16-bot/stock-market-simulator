import api from "./api";

export const getAdminActivities = async () => {
    const response = await api.get("/admin/activity");
    return response.data;
};
