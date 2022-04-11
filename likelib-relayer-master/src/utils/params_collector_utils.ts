export const removeNullishValues = (params: Record<string, any>) => {
    const result: Record<string, any> = {};

    for (const key in params) {
        const value = params[key];

        if (value) {
            result[key] = value;
        }
    }

    return result;
}