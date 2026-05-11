import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, "username is required"],
            minLength: [4, "Min length of username is 4 characters"],
            maxLength: [17, "Username exceeds 17 characters"],
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "password is required"],
            minLength: [6, "Min 6 characters required"],
        },
        role: {
            type: String,
            enum: ["trader", "admin", "stockmanager"],
            required: [true, "role is required"],
        },
        walletBalance: {
            type: Number,
            default: function () {
                return this.role === "trader" ? 100000 : undefined;
            },
        },
        isUserActive: {
            type: Boolean,
            default: true,
        },
        profileImage: {
            type: String,
            default: "",
        },
        riskTolerance: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
        },
        timeHorizon: {
            type: String,
            enum: ["Short Term", "Long Term"],
            default: "Long Term",
        },
        goal: {
            type: String,
            enum: ["Growth", "Income", "Capital Preservation"],
            default: "Growth",
        },
    },
    {
        timestamps: true,
        versionKey: false,
        strict: "throw",
    }
);

// ── INDEXES ──
// email: used in login (findOne by email)
userSchema.index({ email: 1 });
// role: used in leaderboard (find all traders)
userSchema.index({ role: 1 });
// Combined for active trader queries
userSchema.index({ role: 1, isUserActive: 1 });

export const userModel = mongoose.models.user || model("user", userSchema);