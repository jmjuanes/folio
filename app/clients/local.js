import {get, set, del, delMany, update, keys, createStore} from "idb-keyval";
import {promisifyRequest} from "idb-keyval";
import {uid} from "uid/secure";
import {CURRENT_VERSION, DB_NAME, DB_STORE} from "../constants.js";
import {KEY_VERSION, KEY_SETTINGS} from "../constants.js";

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
        async init() {
            const allKeys = await keys(store);
            if (allKeys.length === 0) {
                await set(KEY_VERSION, CURRENT_VERSION, store);
                await set(KEY_SETTINGS, {}, store);
            }
            return true;
        },
        getVersion() {
            return get(KEY_VERSION, store);
        },
        getSettings() {
            return get(KEY_SETTINGS, store);
        },
        updateSettings(newSettings) {
            return update(KEY_SETTINGS, prev => ({...prev, ...newSettings}), store);
        },
        async listProjects() {
            const list = [];
            await each(store, (key, value) => {
                if (key !== KEY_SETTINGS && key !== KEY_VERSION) {
                    return list.push({
                        id: key,
                        title: value.title,
                        createdAt: value.createdAt,
                        updatedAt: value.updatedAt,
                    });
                }
            });
            return list;
        },
        async deleteProjects() {
            const projects = await keys(store);
            return delMany(projects.filter(key => key !== KEY_SETTINGS && key !== KEY_VERSION), store);
        },
        async createProject(initialData) {
            // We do not need to register all project metadata, as the board will initialize the
            // non existing fields (like elements, assets and other settings)
            const newProject = {
                title: "Untitled",
                ...initialData,
                id: uid(12),
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            await set(newProject.id, newProject, store);
            return newProject.id;
        },
        async getProject(id) {
            return get(id, store);
        },
        async updateProject(id, newData) {
            const projectUpdater = project => {
                return {
                    ...project,
                    ...newData,
                    updatedAt: Date.now(),
                };
            };
            return update(id, projectUpdater, store);
        },
        async deleteProject(id) {
            const projects = await keys(store);
            if (!projects.includes(id)) {
                return Promise.reject(new Error(`Project '${id}' not found`));
            }
            return del(id, store);
        },
    };
};
