import { adminActivityModel } from "../models/AdminActivityModel.js";

export const getAdminActivities = async (req, res, next) => {
    try {
        const activities = await adminActivityModel.find()
            .sort({ createdAt: -1 })
            .limit(50);
            
        res.status(200).json({
            success: true,
            payload: activities
        });
    } catch (err) {
        next(err);
    }
};

export const logAdminActivity = async (adminId, action, targetType, targetId, details) => {
    try {
        await adminActivityModel.create({
            adminId,
            action,
            targetType,
            targetId,
            details
        });
    } catch (err) {
        console.error("Failed to log admin activity:", err);
    }
};
