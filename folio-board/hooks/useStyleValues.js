export const useStyleValues = (elements, defaultValues) => {
    if (elements.length === 1) {
        return elements[0];
    }
    // TODO: we need to compute common values for all elements
    return defaultValues || {};
};
