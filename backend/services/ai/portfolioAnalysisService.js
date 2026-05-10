// export const analyzePortfolioData = (transactions = []) => {

//     // GROUP STOCKS
//     const portfolioMap = {};

//     for (const tx of transactions) {

//         const symbol = tx.stockSymbol;

//         if (!portfolioMap[symbol]) {

//             portfolioMap[symbol] = {
//                 ticker: symbol,
//                 quantity: 0,
//                 invested: 0
//             };
//         }

//         // BUY
//         if (tx.transactionType === "BUY") {

//             portfolioMap[symbol].quantity += tx.quantity;

//             portfolioMap[symbol].invested +=
//                 tx.quantity * tx.price;
//         }

//         // SELL
//         else if (tx.transactionType === "SELL") {

//             portfolioMap[symbol].quantity -= tx.quantity;
//         }
//     }

//     // CONVERT TO ARRAY
//     const portfolio =
//         Object.values(portfolioMap)
//             .filter(stock => stock.quantity > 0);

//     // TOTAL INVESTMENT
//     const totalInvestment =
//         portfolio.reduce(
//             (sum, stock) => sum + stock.invested,
//             0
//         );

//     // ADD ALLOCATION %
//     for (const stock of portfolio) {

//         stock.allocation = totalInvestment
//             ? Number(
//                 (
//                     stock.invested /
//                     totalInvestment
//                 ) * 100
//             ).toFixed(2)
//             : 0;
//     }

//     return portfolio;
// };

export const calculatePortfolioHealth = (
    portfolioData
) => {

    if (!portfolioData.length) {

        return {
            diversificationScore: 0,
            concentrationRisk: "HIGH",
        };
    }

    const total =
        portfolioData.reduce(
            (acc, item) =>
                acc + item.total,
            0
        );

    const biggestPosition =
        Math.max(
            ...portfolioData.map(
                (p) => p.total
            )
        );

    const concentration =
        (biggestPosition / total) * 100;

    return {

        diversificationScore:
            Math.max(
                0,
                100 - concentration
            ),

        concentrationRisk:
            concentration > 50
                ? "HIGH"
                : concentration > 30
                ? "MEDIUM"
                : "LOW",
    };
};