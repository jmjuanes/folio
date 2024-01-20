const s = JSON.stringify;
const p = JSON.parse;

// Get value from local storage
export const getItem = (key, defaultValue) => {
    if (typeof defaultValue === "object") {
        return p(localStorage.getItem(key));
    }
    // Just get saved value
    return localStorage.getItem(key);
};

// Check if an item exists in the storage
export const hasItem = key => {
    return localStorage.getItem(key) !== null;
};

// Remove the provided item from the storage
export const removeItem = key => {
    return localStorage.removeItem(key);
};

// Rename an item
export const renameItem = (oldKey, newKey) => {
    const value = localStorage.getItem(oldKey);
    if (value !== null) {
        localStorage.setItem(newKey, value);
        localStorage.removeItem(oldKey);
    }
};

// Set value in local storage
export const setItem = (key, value) => {
    localStorage.setItem(key, typeof value === "object" ? s(value) : value);
};
