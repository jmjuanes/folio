export type GroupedDates = {
    today: any[];
    yesterday: any[];
    thisWeek: any[];
    thisMonth: any[];
    others: any[];
};

export type GroupedFieldFn = (item: any) => number;

// @description Utility function to group items by a field based on their modification date or 
// in another date field.
// @param {Array} items - The array of items to group.
// @param {String} field - The field to use for grouping, defaults to "updated_at".
// @returns {Object} An object with keys for Today, Yesterday, ThisWeek, ThisMonth, and Others,
export const groupByDate = (items: any[] = [], getField: GroupedFieldFn): GroupedDates => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(startOfDay);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const groups: GroupedDates = {
        today: [],
        yesterday: [],
        thisWeek: [],
        thisMonth: [],
        others: []
    };

    items.forEach(item => {
        const itemDate = new Date(getField(item));
        if (itemDate >= startOfDay) {
            groups.today.push(item);
        } else if (itemDate >= yesterday) {
            groups.yesterday.push(item);
        } else if (itemDate >= startOfWeek) {
            groups.thisWeek.push(item);
        } else if (itemDate >= startOfMonth) {
            groups.thisMonth.push(item);
        } else {
            groups.others.push(item);
        }
    });

    return groups;
};

// @description format a date to a human-readable string with hour and minutes
// @param {String} dateStr - The date string to format.
// @returns {String} The formatted date string with time.
export const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

/**
 * Formats a timestamp into a human-readable relative time string.
 * Supports minutes, hours, days, weeks, months, and years, with automatic localization.
 *
 * @param {number} updatedAt - The epoch timestamp (in milliseconds) representing when the item was last updated.
 * @param {string} [locale="en"] - The BCP 47 language tag to format the output string (e.g., 'en', 'es', 'fr').
 * @returns {string} A localized string representing the relative time elapsed since the timestamp (e.g., "45 minutes ago", "yesterday").
 *
 * @example
 * const lastEdited = Date.now() - 45 * 60 * 1000;
 * getRelativeTimeString(lastEdited); // Returns "45 minutes ago"
 * getRelativeTimeString(lastEdited, 'es'); // Returns "hace 45 minutos"
 */
export const getRelativeTimeString = (updatedAt: number | string, locale: string = "en"): string => {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerWeek = msPerDay * 7;
    const msPerMonth = msPerDay * 30.44;
    const msPerYear = msPerDay * 365.24;
    const timestamp = new Date(updatedAt).getTime();
    const elapsed = timestamp - Date.now();
    const absElapsed = Math.abs(elapsed);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    // 1. years elapsed
    if (absElapsed >= msPerYear) {
        return rtf.format(Math.round(elapsed / msPerYear), "year");
    }
    // months elapsed
    else if (absElapsed >= msPerMonth) {
        return rtf.format(Math.round(elapsed / msPerMonth), "month");
    }
    // weeks elapsed
    else if (absElapsed >= msPerWeek) {
        return rtf.format(Math.round(elapsed / msPerWeek), "week");
    }
    // days elapsed
    else if (absElapsed >= msPerDay) {
        return rtf.format(Math.round(elapsed / msPerDay), "day");
    }
    // hours elapsed
    else if (absElapsed >= msPerHour) {
        return rtf.format(Math.round(elapsed / msPerHour), "hour");
    }
    // minutes or seconds
    const minutes = Math.round(elapsed / msPerMinute);
    return minutes === 0 ? rtf.format(0, "minute") : rtf.format(minutes, "minute");
};
