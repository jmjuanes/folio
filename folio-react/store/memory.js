const noop = () => {};

// @description generates an in-memory store
// @returns {object} store instance
// @returns {function} store.initialize method to initialize the store, but it's a no-op
// @returns {object} store.data fake data manager that implements the get and set methods
// @returns {object} store.library fake library manager that implements the get and set methods
// @returns {object} store.preferences fake preferences manager that implements the get and set methods
export const createMemoryStore = () => {
    return {
        initialize: () => {
            return Promise.resolve(true);
        },
        data: {
            get: () => {
                return Promise.resolve({});
            },
            set: noop,
        },
        library: {
            get: () => {
                return Promise.resolve({});
            },
            set: noop,
        },
        preferences: {
            get: () => {
                return Promise.resolve({});
            },
            set: noop,
        },
    };
};
