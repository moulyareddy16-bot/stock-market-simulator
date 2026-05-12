// export const getMarketSentimentData = async (
//     portfolio = []
// ) => {

//     // TEMP MOCK DATA
//     // REAL FINNHUB COMES IN STEP 7

//     return portfolio.map(stock => {

//         let sentiment = 0.5;
//         let rsi = 50;
//         let priceChange = 0;

//         // SAMPLE INTELLIGENCE

//         if (stock.ticker === "AAPL") {

//             sentiment = 0.82;
//             rsi = 34;
//             priceChange = 2.3;
//         }

//         else if (stock.ticker === "TSLA") {

//             sentiment = 0.28;
//             rsi = 77;
//             priceChange = 4.9;
//         }

//         else if (stock.ticker === "IBM") {

//             sentiment = 0.71;
//             rsi = 43;
//             priceChange = 1.2;
//         }

//         return {

//             ticker: stock.ticker,

//             sentiment,

//             rsi,

//             priceChange
//         };
//     });
// };

export const calculateOverallSentiment = (marketData) => {

    if (!marketData || !marketData.length) {
        return "NEUTRAL";
    }

    // sentiment field may not be present in all marketData shapes
    const validItems = marketData.filter(
        (item) => item.sentiment != null && !isNaN(item.sentiment)
    );

    if (!validItems.length) {
        return "NEUTRAL";
    }

    const avg = validItems.reduce(
        (acc, item) => acc + item.sentiment,
        0
    ) / validItems.length;

    if (avg >= 0.7) return "BULLISH";
    if (avg >= 0.45) return "NEUTRAL";
    return "BEARISH";
};