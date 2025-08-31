import React from "react";
import { loadFromJson } from "folio-react/lib/json.js";
import { useApi } from "../hooks/use-api.ts";
import { useRouter } from "./router.tsx";
import { useSession } from "./authentication.tsx";
import { getCurrentHash } from "../utils/hash.ts";
import { COLLECTIONS } from "../constants.ts";

// application state type
export type AppState = {
    documents: {
        boards: any[];
    };
    refresh: () => void;

    // app routing
    openHome: () => void;
    openBoard: (boardId: string) => void;
    isBoardOpen: (boardId: string) => boolean;

    // create or import documents
    createBoard: (initialData: any) => Promise<any>;
    importBoard: () => Promise<any>;

    // manipulating a document
    getBoard: (boardId: string) => Promise<any>;
    updateBoard: (boardId: string, attributes: any, data: string) => Promise<void>;
    deleteBoard: (boardId: string) => Promise<void>;

    // user and session management
    logout: () => void;
};

// internal app state context
const AppStateContext = React.createContext<{app: AppState, appVersion: number}>(null);

// @description hook to use app state
export const useAppState = () => {
    return React.useContext(AppStateContext);
};

// @description app state provider
export const AppStateProvider = ({ children }): React.JSX.Element => {
    const [ appVersion, incrementAppVersion ] = React.useReducer((x: number): number => x + 1, 0);
    const session = useSession();
    const app = React.useRef({}).current;
    const api = useApi(session.token as string);
    const [ hash, redirect ] = useRouter();

    // internal method to fetch documents of the logged user
    const fetchUserDocuments = React.useCallback(() => {
        app.documents = {}; // clean documents reference
        api("GET", `/_documents/${COLLECTIONS.BOARD}`).then(response => {
            app.documents.boards = response?.data || [];
            incrementAppVersion();
        });
    }, [ api, incrementAppVersion ]);

    // initialize app actions
    if (!app.refresh) {
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
                return getCurrentHash() === `#b/${boardId}`;
            },
            createBoard: async (initialData: any = {}) => {
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
            logout: () => {
                // on logout, we just destroy the session. This will automatically
                // display the login screen
                session.destroy();
            },
        });
    }

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
