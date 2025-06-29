// @description promisify a value
// @params {object|function|promise} value - value to wrap in a promise
// @returns {promise} promise that resolves to the value
export const promisifyValue = value => {
    return Promise.resolve(null).then(() => {
        // execute the provided function
        if (typeof value === "function") {
            return value();
        }
        // if other value is provided, just return it
        return value;
    });
};
