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