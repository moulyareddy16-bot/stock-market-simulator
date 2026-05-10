import mongoose, { Schema, model } from "mongoose";

const transactionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: [true, "userId is required"],
        },
        stockSymbol: {
            type: String,
            required: [true, "stockSymbol is required"],
            uppercase: true,
            trim: true,
        },
        transactionType: {
            type: String,
            required: [true, "transactionType is required"],
            enum: ["BUY", "SELL"],
        },
        quantity: {
            type: Number,
            required: [true, "quantity is required"],
            min: [1, "Quantity must be at least 1"],
        },
        pricePerShare: {
            type: Number,
            required: [true, "pricePerShare is required"],
            min: [0, "Price cannot be negative"],
        },
        totalAmount: {
            type: Number,
            required: [true, "totalAmount is required"],
            min: [0, "Total amount cannot be negative"],
        },
    },
    {
        timestamps: true,
        versionKey: false,
        strict: "throw",
    }
);

// ── INDEXES ──
// Most queried patterns:
// 1. All transactions for a user (portfolio, AI, leaderboard)
// 2. Transactions for a user + specific stock (sell validation)
// 3. Sorting by newest first
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, stockSymbol: 1 });
transactionSchema.index({ stockSymbol: 1 });

export const transactionModel =
    mongoose.models.transaction || model("transaction", transactionSchema);