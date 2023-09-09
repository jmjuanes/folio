import React from "react";
import {uid} from "uid/secure";
import * as idb from "idb-keyval";
import {VERSION} from "../constants.js";
import {migrate} from "../board/migrate.js";
import {Loading} from "../components/Loading.jsx";
import {useDelay} from "../hooks/index.js";

// Store keys for IDB
const LEGACY_STORE_KEYS = {
    VERSION: "version",
    DATA: "data",
};

const store = idb.createStore("folio", "folio-store");
// const ClientContext = React.createContext(null);

// Local client instance
const localClient = {
    config: {},
    session: {},
    initialize: async () => {
        const keys = await idb.keys(store);
        // Check if we need to migrate to multiproject
        if (keys.length > 0 && keys.includes(LEGACY_STORE_KEYS.DATA)) {
            const data = await idb.get(LEGACY_STORE_KEYS.DATA, store);
            await idb.set("default", data, store);
            await idb.del(LEGACY_STORE_KEYS.DATA, store);
            await idb.del(LEGACY_STORE_KEYS.VERSION, store);
        }
        // Store initialized
        return true;
    },
    getUserBoards: async () => {
        const boards = [];
        await store("readonly", tsx => {
            tsx.openCursor().addEventListener("success", event => {
                const cursor = event.target.result;
                if (cursor) {
                    boards.push({
                        id: cursor.key,
                        title: cursor.value?.title || "untitled",
                        createdAt: cursor.value?.createdAt,
                        updatedAt: cursor.value?.updatedAt,
                        coverColor: cursor.value?.coverColor,
                        coverImage: cursor.value?.coverImage,
                    });
                    return cursor.continue();
                }
            });
            return idb.promisifyRequest(tsx.transaction);
        });
        return boards.sort((a, b) => {
            return b.updatedAt - a.updatedAt;
        });
    },
    addBoard: boardData => {
        const boardId = uid(16);
        return idb.set(boardId, boardData, store).then(() => {
            return {
                id: boardId,
            };
        });
    },
    getBoard: async boardId => {
        let data = await idb.get(boardId, store);
        if (!data) {
            return Promise.reject(new Error(`Board ${boardId} not found`));
        }
        // Check if we need to perform an upgrade to the new version
        if (data.version !== VERSION) {
            data = {
                ...data,
                ...migrate(data, data.version),
            };
            await idb.set(boardId, data, store);
        }
        // Return migrated data
        return data;
    },
    updateBoard: (boardId, boardData) => {
        return idb.update(boardId, prevData => ({...prevData, ...boardData}), store);
    },
    deleteBoard: boardId => {
        return idb.del(boardId, store);
    },
};

// Use client hook
export const useClient = () => {
    return localClient;
};

// Client provider
export const ClientProvider = props => {
    const [clientReady, setClientReady] = React.useState(false);
    useDelay(props.delay, () => {
        localClient.initialize().then(() => {
            return setClientReady(true);
        });
    });
    // Check if client is not ready
    if (!clientReady) {
        return (
            <Loading />
        );
    }
    // Render app content
    return (
        <React.Fragment>
            {props.children}
        </React.Fragment>
    );
};

ClientProvider.defaultProps = {
    delay: 1000,
};
