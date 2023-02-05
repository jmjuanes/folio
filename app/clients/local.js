import {
    get,
    set,
    del,
    update,
    keys,
    createStore,
    promisifyRequest,
} from "idb-keyval";
import {DB_NAME, DB_STORE} from "../constants.js";

// A tiny forEach implementation for the provided store
const each = (customStore, callback) => {
    return customStore("readonly", store => {
        store.openCursor().onsuccess = function () {
            if (this.result) {
                callback(this.result.key, this.result.value);
                this.result.continue();
            }
        };
        return promisifyRequest(store.transaction);
    });
};

export const createLocalClient = () => {
    const store = createStore(DB_NAME, DB_STORE);
    return {
        store: store,
        async list() {
            const list = [];
            await each(store, (key, value) => list.push({
                id: key,
                title: value.title,
                createdAt: value.createdAt,
                updatedAt: value.updatedAt,
            }));
            return list;
        },
        async create(initialData) {
            // We do not need to register all project metadata, as the board will initialize the
            // non existing fields (like elements, assets and other settings)
            const newProject = {
                title: "Untitled",
                ...initialData,
                id: Math.random().toString(36).slice(2, 7),
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            await set(newProject.id, newProject, store);
            return newProject.id;
        },
        async get(id) {
            return get(id, store);
        },
        async update(id, newData) {
            const projectUpdater = project => {
                return {
                    ...project,
                    ...newData,
                    updatedAt: Date.now(),
                };
            };
            return update(id, projectUpdater, store);
        },
        async delete(id) {
            const projects = await keys(store);
            if (!projects.includes(id)) {
                return Promise.reject(new Error(`Project '${id}' not found`));
            }
            return del(id, store);
        }
    };
};

