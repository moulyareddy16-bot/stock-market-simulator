const aiCache = new Map();

export const getCachedAIResponse = (key) => {

    const data = aiCache.get(key);

    if (!data) return null;

    // 5 minute cache
    const isExpired =
        Date.now() - data.timestamp > 5 * 60 * 1000;

    if (isExpired) {

        aiCache.delete(key);

        return null;
    }

    return data.value;
};

export const setCachedAIResponse = (
    key,
    value,
    isSuccess = true  // Only cache successful AI responses
) => {
    if (!isSuccess) return; // Never cache fallback/error responses

    aiCache.set(key, {
        value,
        timestamp: Date.now()
    });
};

export const clearCachedAIResponse = (key) => {
    if (key) aiCache.delete(key);
    else aiCache.clear();
};