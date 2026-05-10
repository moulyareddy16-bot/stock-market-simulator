

export const buildRiskProfile = (user, portfolio = []) => {

    const balance = user?.walletBalance || 0;

    let riskTolerance = "Medium";

    // Example intelligent logic
    if (balance < 10000) {
        riskTolerance = "Low";
    }

    if (balance > 100000) {
        riskTolerance = "High";
    }

    // Detect concentration risk
    let concentrationRisk = false;

    if (portfolio.length > 0) {

        const highestAllocation = Math.max(
            ...portfolio.map(p => p.allocation || 0)
        );

        concentrationRisk = highestAllocation > 45;
    }

    return {
        riskTolerance,
        concentrationRisk,
        timeHorizon: balance > 50000 ? "Long Term" : "Short Term",
        goal:
            riskTolerance === "High"
                ? "Growth"
                : riskTolerance === "Low"
                    ? "Capital Preservation"
                    : "Balanced Growth"
    };
};