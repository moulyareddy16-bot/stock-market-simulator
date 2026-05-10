export const analyzePortfolioData = (
    transactions = []
) => {

    const portfolioMap = {};

    // =========================
    // PROCESS TRANSACTIONS
    // =========================

    for (const tx of transactions) {

        const symbol = tx.stockSymbol;

        // CREATE STOCK ENTRY
        if (!portfolioMap[symbol]) {

            portfolioMap[symbol] = {

                ticker: symbol,

                quantity: 0,

                invested: 0
            };
        }

        // =========================
        // BUY
        // =========================

        if (tx.transactionType === "BUY") {

            portfolioMap[symbol].quantity +=
                tx.quantity;

            portfolioMap[symbol].invested +=
                tx.quantity * tx.pricePerShare;
        }

        // =========================
        // SELL
        // =========================

        else if (tx.transactionType === "SELL") {

            portfolioMap[symbol].quantity -=
                tx.quantity;
        }
    }

    // =========================
    // REMOVE EMPTY HOLDINGS
    // =========================

    const portfolio =
        Object.values(portfolioMap)
            .filter(stock => stock.quantity > 0);

    // =========================
    // TOTAL INVESTMENT
    // =========================

    const totalInvestment =
        portfolio.reduce((sum, stock) => {

            return sum + stock.invested;

        }, 0);

    // =========================
    // CALCULATE ALLOCATION
    // =========================

    for (const stock of portfolio) {

        stock.allocation =
            totalInvestment > 0

                ? Number(

                    (
                        stock.invested /
                        totalInvestment

                    ) * 100

                ).toFixed(2)

                : 0;
    }

    return portfolio;
};