export const buildAIPrompt = ({
    userProfile,
    portfolioData,
    marketData,
}) => {

    return `

You are the Alpha-Insight Engine.

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

PORTFOLIO DATA:
${JSON.stringify(portfolioData, null, 2)}

MARKET DATA:
${JSON.stringify(marketData, null, 2)}

TASK:

1. Analyze overall portfolio health
2. Detect weak performing assets
3. Suggest BUY / SELL / HOLD
4. Detect risk concentration
5. Detect sentiment conflicts
6. Mention bull traps if needed
7. Generate executive summary
8. Generate risk warning

RETURN STRICT JSON:

{
  "summary": "",
  "marketSentiment": "",
  "traderScore": 0,
  "riskWarning": "",
  "suggestions": [
    {
      "type": "",
      "title": "",
      "description": "",
      "impact": ""
    }
  ]
}

`;
};