import React from "react";
import { useLocalStorage } from "react-use";
import { useApi } from "../hooks/use-api.ts";
import { COLLECTIONS } from "../constants.ts";

export type Client = {
    token: string;
    config: () => Promise<any>;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
    graphql: (query: string, variables?: any) => Promise<any>;
    documents: (collection: COLLECTIONS) => Promise<any[]>;
    addDocument: (collection: COLLECTIONS, payload: any) => Promise<any>;
    getDocument: (collection: COLLECTIONS, id: string) => Promise<any>;
    updateDocument: (collection: COLLECTIONS, id: string, payload: any) => Promise<any>;
    deleteDocument: (collection: COLLECTIONS, id: string) => Promise<any>;
};

// main client context
const ClientContext = React.createContext({}) as any;

// @description hook to get the client context
export const useClient = (): Client => {
    return React.useContext(ClientContext) as Client;
};

// @description client context provider
export const ClientProvider = ({ sessionKey = "", children }): React.JSX.Element => {
    const [token, setToken, removeToken] = useLocalStorage(sessionKey || "folio-session");
    const api = useApi(token as string);

    // api to access to the REST API
    const client: Client = React.useMemo(() => ({
        token: token as string,
        logout: () => {
            removeToken();
        },
        login: (credentials = {}) => {
            return api("POST", "/_login", credentials).then(response => {
                if (response?.data?.token) {
                    setToken(response.data.token);
                }
            });
        },
        config: () => {
            return api("GET", "/_config");
        },
        graphql: (query, variables) => {
            return api("POST", "/_graphql", { query, variables });
        },
        documents: (collection: COLLECTIONS) => {
            return api("GET", `/_documents/${collection}`);
        },
        addDocument: (collection: COLLECTIONS, payload: any = {}) => {
            return api("POST", `/_documents/${collection}`, payload);
        },
        getDocument: (collection: COLLECTIONS, id: string) => {
            return api("GET", `/_documents/${collection}/${id}`);
        },
        updateDocument: (collection: COLLECTIONS, id: string, payload: any = {}) => {
            return api("PATCH", `/_documents/${collection}/${id}`, payload);
        },
        deleteDocument: (collection: COLLECTIONS, id: string) => {
            return api("DELETE", `/_documents/${collection}/${id}`);
        },
    }), [token, setToken, removeToken]);

    return (
        <ClientContext.Provider value={client}>
            {children}
        </ClientContext.Provider>
    );
};
