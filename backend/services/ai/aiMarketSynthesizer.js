

export const analyzeMarketSignals = (marketData = []) => {

    return marketData.map(stock => {

        const rsi = stock.rsi || 50;
        const sentiment = stock.sentiment || 0.5;
        const priceChange = stock.priceChange || 0;

        let signal = "NEUTRAL";

        // Bull Trap Detection
        if (priceChange > 0 && sentiment < 0.4) {
            signal = "BULL_TRAP";
        }

        // Strong Buy
        else if (rsi < 35 && sentiment > 0.7) {
            signal = "BUY";
        }

        // Overbought
        else if (rsi > 75) {
            signal = "OVERBOUGHT";
        }

        // Bearish
        else if (sentiment < 0.3) {
            signal = "BEARISH";
        }

        return {
            ...stock,
            signal
        };
    });
};