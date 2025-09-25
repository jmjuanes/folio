// @description get greeting message based on the current time
// @returns {String} A greeting message based on the current time of day.
export const getGreetingMessage = (): string => {
    const hours = (new Date()).getHours();
    if (hours < 12) {
        return "Good morning";
    }
    else if (hours < 20) {
        return "Good afternoon";
    }
    else {
        return "Good evening";
    }
};

export type GroupedDates = {
    today: any[];
    yesterday: any[];
    thisWeek: any[];
    thisMonth: any[];
    others: any[];
};

// @description Utility function to group items by a field based on their modification date or 
// in another date field.
// @param {Array} items - The array of items to group.
// @param {String} field - The field to use for grouping, defaults to "updated_at".
// @returns {Object} An object with keys for Today, Yesterday, ThisWeek, ThisMonth, and Others,
export const groupByDate = (items: any[] = [], field: string = "updated_at"): GroupedDates => {
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
        const itemDate = new Date(item[field]);
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

// @description format a date to a human-readable string
// @param {String} dateStr - The date string to format.
// @returns {String} The formatted date string.
export const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};
