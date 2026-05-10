import api from "./api";

export const getAdminActivities = async () => {
    const response = await api.get("/admin/activity");
    return response.data;
};
export const clearAdminActivities = async () => {
    const response = await api.delete("/admin/activity");
    return response.data;
};
