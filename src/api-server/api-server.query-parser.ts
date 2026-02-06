export const querystringParser = (input: string) => {
    const result: Record<string, unknown> = {};
    for (const [key, value] of new URLSearchParams(input)) {
        try {
            result[key] = JSON.parse(value);
        } catch {
            result[key] = value;
        }
    }
    return result;
};
