// @description clear the current focus
export const clearFocus = () => {
    if (document?.activeElement && document?.activeElement !== document.body) {
        document.activeElement.blur();
    }
};
