import mongoose, { Schema, model } from "mongoose";

const adminActivitySchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ["USER_STATUS", "DELETE_USER", "STOCK_STATUS", "DELETE_STOCK", "ADD_STOCK"]
    },
    targetType: {
        type: String,
        required: true,
        enum: ["USER", "STOCK"]
    },
    targetId: {
        type: String, // Can be UserId or StockSymbol
        required: true
    },
    details: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const adminActivityModel = model("adminActivity", adminActivitySchema);
