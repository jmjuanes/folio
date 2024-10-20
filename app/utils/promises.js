// Promisify a value
export const promisifyValue = value => {
    if (typeof value === "function") {
        // Wrapp the call of this function inside a promise chain
        return Promise.resolve(null).then(() => {
            return value();
        });
    }
    // Other value is not supported
    return Promise.resolve(value);
};

