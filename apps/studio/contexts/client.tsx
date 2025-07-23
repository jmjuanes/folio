import React from "react";
import { useLocalStorage } from "react-use";
import { useApi } from "../hooks/use-api.ts";

export type Client = {
    token: string;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
    user: () => Promise<any>;
    query: (query: string, variables?: any) => Promise<any>;
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
        logout: () => removeToken(),
        login: (credentials) => {
            return api("POST", "/_login", credentials || {}).then(data => {
                setToken(data.token);
            });
        },
        user: () => {
            return api("GET", "/_user");
        },
        query: (query, variables) => {
            return api("POST", "/_graphql", {query, variables}).then(response => {
                if (response.errors) {
                    return Promise.reject(response);
                }
                // return response object
                return response;
            });
        },
    }), [token, setToken, removeToken]);

    return (
        <ClientContext.Provider value={client}>
            {children}
        </ClientContext.Provider>
    );
};
