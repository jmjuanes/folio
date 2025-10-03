import React from "react";
import { Collection } from "folio-server/types/document.ts";
import { loadFromJson, saveAsJson } from "folio-react/lib/json.js";
import { useClient } from "./client.tsx";
import { useRouter } from "./router.tsx";
import { getCurrentHash } from "../utils/hash.ts";
import {
    QUERY_DOCUMENTS,
    GET_DOCUMENT,
    ADD_DOCUMENT,
    UPDATE_DOCUMENT,
    DELETE_DOCUMENT,
    GET_USER,
} from "../graphql.ts";

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
    saveDocument: (documentId: string) => Promise<void>;

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
    const app = React.useRef({}).current as AppState;
    const client = useClient();
    const [ hash, redirect ] = useRouter();

    // internal method to fetch documents of the logged user
    const fetchUserDocuments = React.useCallback(() => {
        app.documents = []; // clean documents reference
        client.graphql(QUERY_DOCUMENTS, {}).then(response => {
            app.documents = response?.queryDocuments || [];
            incrementAppVersion();
        });
    }, [ client, incrementAppVersion ]);

    // initialize app actions
    if (!app.refresh) {
        Object.assign(app, {
            refresh: () => {
                fetchUserDocuments();
            },
            openHome: () => {
                redirect(`#home`);
            },
            openBoard: (boardId: string) => {
                redirect(`#${boardId}`);
            },
            isBoardOpen: (boardId: string) => {
                return getCurrentHash() === `#${boardId}`;
            },

            createDocument: async (collection: Collection, initialData: any = {}) => {
                const response = await client.graphql(ADD_DOCUMENT, {
                    collection: collection,
                    name: initialData?.title || "Untitled",
                    thumbnail: null,
                    data: JSON.stringify(initialData || {}),
                });
                return response?.addDocument || null;
            },
            importDocument: () => {
                return loadFromJson().then(boardData => {
                    return app.createDocument(Collection.BOARD, boardData);
                });
            },
            saveDocument: async (documentId: string) => {
                const document = await app.getDocument(documentId);
                if (document && document.data) {
                    return saveAsJson(JSON.parse(document.data));
                }
            },

            getDocument: async (documentId: string) => {
                const response = await client.graphql(GET_DOCUMENT, {
                    id: documentId,
                });
                return response?.getDocument || null;
            },
            deleteDocument: async (documentId: string) => {
                const response = await client.graphql(DELETE_DOCUMENT, {
                    id: documentId,
                });
                return response?.deleteDocument || null;
            },
            updateDocument: async (documentId: string, documentPayload: DocumentPayload) => {
                const response = await client.graphql(UPDATE_DOCUMENT, {
                    id: documentId,
                    name: documentPayload.name,
                    thumbnail: documentPayload.thumbnail,
                    data: documentPayload.data,
                });
                return response?.updateDocument || null;
            },

            getUser: async () => {
                const response = await client.graphql(GET_USER, {});
                return response?.getUser as User || null;
            },
            logout: () => {
                // on logout, we just destroy the session. This will automatically
                // display the login screen
                client.logout();
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
