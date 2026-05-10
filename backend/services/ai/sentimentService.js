export const calculateOverallSentiment = (
    marketData
) => {

    if (!marketData.length) {
        return "NEUTRAL";
    }

    const avg =
        marketData.reduce(
            (acc, item) =>
                acc + item.sentiment,
            0
        ) / marketData.length;

    if (avg >= 0.7) {
        return "BULLISH";
    }

    if (avg >= 0.45) {
        return "NEUTRAL";
    }

    return "BEARISH";
};