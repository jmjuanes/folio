import React from "react";
import { loadFromJson } from "folio-react/lib/json.js";
import { useConfirm } from "folio-react/contexts/confirm.jsx";
import { useApi } from "../hooks/use-api.ts";
import { useRouter } from "./router.tsx";
import { useSession } from "./authentication.tsx";
import { COLLECTIONS } from "../constants.ts";

// internal app state context
const AppStateContext = React.createContext(null);

// @description hook to use app state
export const useAppState = () => {
    return React.useContext(AppStateContext);
};

// @description app state provider
export const AppStateProvider = ({ children }): React.JSX.Element => {
    const [ appVersion, incrementAppVersion ] = React.useReducer<number>((x: number): number => x + 1, 0);
    const session = useSession();
    const app = React.useRef({}).current;
    const api = useApi(session.token as string);
    const [ hash, redirect ] = useRouter();
    const { showConfirm } = useConfirm();

    // internal method to fetch documents of the logged user
    const fetchUserDocuments = React.useCallback(() => {
        app.documents = {}; // clean documents reference
        api("GET", `/_documents/${COLLECTIONS.BOARD}`).then(response => {
            app.documents.boards = response?.data || [];
            incrementAppVersion();
        });
    }, [ api, incrementAppVersion ]);

    // assign app actions
    React.useEffect(() => {
        Object.assign(app, {
            refresh: () => {
                fetchUserDocuments();
            },
            openHome: () => {
                redirect(`#`);
            },
            openBoard: (boardId: string) => {
                redirect(`#b/${boardId}`);
            },
            isBoardOpen: (boardId: string) => {
                return hash === `b/${boardId}`;
            },
            createBoard: async (initialData?: any = {}) => {
                const response = await api("POST", `/_documents/${COLLECTIONS.BOARD}`, {
                    attributes: {
                        name: initialData?.title || "Untitled",
                        thumbnail: null,
                    },
                    data: JSON.stringify(initialData || {}),
                });
                return response.data || {};
            },
            importBoard: async () => {
                return loadFromJson().then(boardData => {
                    return app.createBoard(boardData);
                });
            },
            getBoard: (id: string) => {
                return api("GET", `/_documents/${COLLECTIONS.BOARD}/${id}`).then(response => {
                    return response?.data || null;
                });
            },
            deleteBoard: async (id: string) => {
                return api("DELETE", `/_documents/${COLLECTIONS.BOARD}/${id}`);
            },
            updateBoard: async (id: string, attributes?: any, data?: string) => {
                return api("PATCH", `/_documents/${COLLECTIONS.BOARD}/${id}`, {
                    attributes: attributes,
                    data: data,
                });
            },
            showConfirmToDeleteBoard: async (boardId: string) => {
                return new Promise((resolve, reject) => {
                    showConfirm({
                        title: "Delete Board",
                        message: `Are you sure you want to delete this board? This action cannot be undone.`,
                        confirmText: "Delete",
                        callback: () => {
                            app.deleteBoard(boardId)
                                .then(() => resolve())
                                .catch(error => reject(error));
                        },
                    });
                });
            },
            logout: () => {
                // on logout, we just destroy the session. This will automatically
                // display the login screen
                session.destroy();
            },
        });
    }, [ api, fetchUserDocuments, hash ]);

    // when the app is mounted, fetch documents of the logged-in user
    React.useEffect(() => {
        fetchUserDocuments();
    }, []);

    return (
        <AppStateContext.Provider value={{ app, appVersion }}>
            {children}
        </AppStateContext.Provider>
    );
};
