import {createEmptyBoard, encodeBoard, decodeBoard} from "./utils.js";
import {createCommit, decodeCommit} from "./utils.js";

export const createLocalClient = () => {
    const client = {
        _currentUser: null,
        _currentBoard: null,
        _fetchBoard: id => {
            if (client._currentBoard && client._currentBoard.id === id) {
                return Promise.resolve(); // Board already imported
            }
            const board = window.localStorage.getItem(id);
            if (!board) {
                client._currentBoard = null;
                return Promise.reject(new Error(`Board '${id}' not found`));
            }
            client._currentBoard = decodeBoard(board);
            return Promise.resolve();
        },
        boards: {
            list: () => {
                return Promise.resolve([]);
            },
            create: data => {
                return createEmptyBoard(data || {}).then(newBoard => {
                    window.localStorage.setItem(newBoard.id, encodeBoard(newBoard));
                    return newBoard.id; // Return only the board ID
                });
            },
            get: id => {
                return client._fetchBoard(id).then(() => ({
                    id: client._currentBoard.id,
                    name: client._currentBoard.name,
                    description: client._currentBoard.description || "",
                }));
            },
            update: (id, data) => {

            },
        },
        commits: {
            count: id => {
                return client._fetchBoard(id).then(() => client._currentBoard.commits.length);
            },
            list: id => {
                return client._fetchBoard(id).then(() => {
                    return client._currentBoard.commits.map(data => decodeCommit(data));
                });
            },
            get: (id, commitID) => {
                return client._fetchBoard(id)
                    .then(() => client._currentBoard.commits.find(commit => commit.id === commitID))
                    .then(data => decodeCommit(data));
            },
            add: (id, data) => {
                return client._fetchBoard(id)
                    .then(() => createCommit(data))
                    .then(commit => {
                        client._currentBoard.commits.push(commit);
                        window.localStorage.setItem(id, encodeBoard(client._currentBoard));
                        return commit.id; // Return new commit ID
                    });
            },
        },
    };
    return client;
};
