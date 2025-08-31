// @description get current hash fragment
export const getCurrentHash = (): string => {
    return window.location.hash || "#";
};
