import { userModel }
from "../models/UserModel.js";

import {
    transactionModel
}
from "../models/transactionModel.js";

import {
    generateAIChatResponse
}
from "../services/ai/aiConversationService.js";

export const chatWithAI =
async (req, res) => {

    try {

        const userId =
            req.user.id;

        const { message } =
            req.body;

        const user =
            await userModel.findById(
                userId
            );

        const transactions =
            await transactionModel.find({
                userId,
            });

        const portfolioData =
            transactions.map((tx) => ({

                symbol:
                    tx.stockSymbol,

                quantity:
                    tx.quantity,

                total:
                    tx.totalAmount,
            }));

        const marketData = [
            {
                symbol: "AAPL",
                sentiment: 0.82,
                rsi: 64,
            },
            {
                symbol: "TSLA",
                sentiment: 0.44,
                rsi: 76,
            },
        ];

        const response =
            await generateAIChatResponse({

                userId,

                message,

                portfolioData,

                marketData,
            });

        return res.status(200).json({

            success: true,

            response,
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({

            success: false,

            message:
                "AI chat failed",
        });
    }
};