// @description filter a properties list and get a property by its key
// @param {Array} properties - list of properties
// @param {string} key - the key of the property to find
// @returns {Object} - the property object if found, otherwise undefined
export const getPropertyByKey = (properties = [], key = "") => {
    return (properties || []).find(item => {
        return item.object === "property_item" && item?.content?.key === key;
    });
};

// @description create a new property object
// @param {string} key - the property key
// @param {string} value - the property value
export const createProperty = (key = "", value = "") => {
    return {key, value};
};
