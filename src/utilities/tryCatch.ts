export const tryCatch = async <T>(
    promise: Promise<T>,
): Promise<[true, T] | [false, unknown]> => {
    try {
        const result = await promise;
        return [true, result];
    } catch (error) {
        return [false, error];
    }
};
