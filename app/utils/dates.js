// @description get greeting message based on the current time
// @returns {String} A greeting message based on the current time of day.
export const getGreetingMessage = () => {
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

// @description Utility function to group items by a field based on their modification date or 
// in another date field.
// @param {Array} items - The array of items to group.
// @param {String} field - The field to use for grouping, defaults to "updated_at".
// @returns {Object} An object with keys for Today, Yesterday, ThisWeek, ThisMonth, and Others,
export const groupByDate = (items = [], field = "updated_at") => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const groups = {
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
        } else if (itemDate >= new Date(startOfDay.setDate(startOfDay.getDate() - 1))) {
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
