// @description this method helps to convert the results from the database
// to a valid results object
export const formatResult = (result = {}) => {
    // note: the content and attributes fields are stored as JSON strings in the database
    // so we need to parse them before returning the result
    if (!result || typeof result !== "object") {
        return {};
    }
    // ensure the result has the required fields
    if (typeof result.content === "string") {
        result.content = JSON.parse(result.content || "{}");
    }
    // return the result with parsed content and attributes
    return result;
};
