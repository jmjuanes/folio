// @description format a date to a human-readable string with hour and minutes
// @param {String|number} value - the date item to format.
// @returns {String} the formatted date string with time.
export const formatDate = (value: string|number): string => {
    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

// @description checks if both dates are in the same day
export const isSameDay = (date1: Date, date2: Date) => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};
