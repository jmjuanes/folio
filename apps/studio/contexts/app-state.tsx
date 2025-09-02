import React from "react";
import { Collection } from "folio-server/types/document.ts";
import { loadFromJson } from "folio-react/lib/json.js";
import { useApi } from "../hooks/use-api.ts";
import { useRouter } from "./router.tsx";
import { useSession } from "./authentication.tsx";
import { getCurrentHash } from "../utils/hash.ts";

import type { User } from "folio-server/types/user.ts";
import type { Document, DocumentPayload } from "folio-server/types/document.ts";

// application state type
export type AppState = {
    documents: Document[],

    refresh: () => void;

    // app routing
    openHome: () => void;
    openBoard: (boardId: string) => void;
    isBoardOpen: (boardId: string) => boolean;

    // create or import documents
    createDocument: (collection: Collection, initialData: any) => Promise<Document>;
    importDocument: () => Promise<Document>;

    // manipulating a document
    getDocument: (id: string) => Promise<Document | null>;
    updateDocument: (id: string, payload: DocumentPayload) => Promise<Document>;
    deleteDocument: (id: string) => Promise<Document>;

    // user and session management
    getUser: () => Promise<User | null>;
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
    const app = React.useRef({}).current as AppState;
    const api = useApi(session.token as string);
    const [ hash, redirect ] = useRouter();

    // internal method to fetch documents of the logged user
    const fetchUserDocuments = React.useCallback(() => {
        app.documents = []; // clean documents reference
        api("GET", `/_documents`).then(response => {
            app.documents = response?.data || [];
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

            createDocument: async (collection: Collection, initialData: any = {}) => {
                const response = await api("POST", `/_documents`, {
                    collection: collection,
                    name: initialData?.title || "Untitled",
                    thumbnail: null,
                    data: JSON.stringify(initialData || {}),
                });
                return response.data || {};
            },
            importDocument: () => {
                return loadFromJson().then(boardData => {
                    return app.createDocument(Collection.BOARD, boardData);
                });
            },

            getDocument: (id: string) => {
                return api("GET", `/_documents/${id}`).then(response => {
                    return response?.data || null;
                });
            },
            deleteDocument: (id: string) => {
                return api("DELETE", `/_documents/${id}`);
            },
            updateDocument: (id: string, payload: DocumentPayload) => {
                return api("PATCH", `/_documents/${id}`, payload);
            },

            getUser: () => {
                return api("GET", "/_user").then(response => {
                    return response?.data as User || null;
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
