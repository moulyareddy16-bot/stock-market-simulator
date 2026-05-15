const memoryStore = new Map();

export const saveUserMemory = (
    userId,
    message
) => {

    if (!memoryStore.has(userId)) {
        memoryStore.set(userId, []);
    }

    const existing =
        memoryStore.get(userId);

    existing.push({
        role: "user",
        content: message,
        timestamp: Date.now(),
    });

    // LIMIT MEMORY (Reduce to 10 to save tokens/rate limits)
    if (existing.length > 10) {
        existing.shift();
    }

    memoryStore.set(userId, existing);
};

export const saveAIResponse = (
    userId,
    response
) => {

    if (!memoryStore.has(userId)) {
        memoryStore.set(userId, []);
    }

    const existing =
        memoryStore.get(userId);

    existing.push({
        role: "assistant",
        content: response,
        timestamp: Date.now(),
    });

    if (existing.length > 10) {
        existing.shift();
    }

    memoryStore.set(userId, existing);
};

export const getUserMemory = (
    userId
) => {

    return memoryStore.get(userId) || [];
};

export const clearUserMemory = (
    userId
) => {

    memoryStore.delete(userId);
};