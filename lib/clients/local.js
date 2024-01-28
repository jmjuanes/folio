import {uid} from "uid/secure";
import * as idb from "idb-keyval";
import {VERSION} from "@lib/constants.js";
import {migrate} from "@lib/migrate.js";

const store = idb.createStore("folio", "folio-store");
const getBoardId = id => `folio:board:${id}`;

// Local client instance
export const createLocalClient = () => ({
    config: {},
    session: {},
    initialize: async () => {
        const keys = await idb.keys(store);
        // Check if we need to migrate to new projects data
        if (keys.length > 0) {
            for (let i = 0; i < keys.length; i++) {
                if (!keys[i].startsWith("folio:")) {
                    const data = await idb.get(keys[i], store);
                    await idb.set(getBoardId(keys[i]), data, store);
                    await idb.del(keys[i], store);
                }
            }
        }
        // Store initialized
        return true;
    },
    list: async () => {
        const items = [];
        await store("readonly", tsx => {
            tsx.openCursor().addEventListener("success", event => {
                const cursor = event.target.result;
                if (cursor) {
                    items.push({
                        id: cursor.key.replace("folio:board:", ""),
                        title: cursor.value?.title || "untitled",
                        createdAt: cursor.value?.createdAt,
                        updatedAt: cursor.value?.updatedAt,
                    });
                    return cursor.continue();
                }
            });
            return idb.promisifyRequest(tsx.transaction);
        });
        return items;
    },
    add: (data = {}) => {
        const boardId = uid(16);
        const boardData = {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...data,
        };
        return idb.set(getBoardId(boardId), boardData, store)
            .then(() => boardId);
    },
    get: async id => {
        let data = await idb.get(getBoardId(id), store);
        if (!data) {
            return Promise.resolve(null);
            // return Promise.reject(new Error(`Board ${boardId} not found`));
        }
        // Check if we need to perform an upgrade to the new version
        if (data.version !== VERSION) {
            data = {
                ...data,
                ...migrate(data, data.version),
            };
            await idb.set(getBoardId(id), data, store);
        }
        // Return migrated data
        return data;
    },
    update: (id, data) => {
        return idb.update(getBoardId(id), prev => ({...prev, ...data}), store);
    },
    delete: id => {
        return idb.del(getBoardId(id), store);
    },
});
