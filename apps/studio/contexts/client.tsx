import React from "react";
import { useLocalStorage } from "react-use";
import { useApi } from "../hooks/use-api.ts";

import type { PropsWithChildren, JSX } from "react";
import type { User } from "folio-server/types/user.ts";
import { Preferences } from "folio-react/contexts/preferences.tsx";

const SESSION_KEY = "folio-session";

export type Client = {
    token: string;
    config: () => Promise<any>;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
    graphql: (query: string, variables?: any) => Promise<any>;
    getAuthenticatedUser: () => Promise<User>;
    getUserPreferences: () => Promise<Partial<Preferences>>;
    updateUserPreferences: (preferences: Partial<Preferences>) => Promise<void>;
};

// main client context
const ClientContext = React.createContext({}) as any;

// @description hook to get the client context
export const useClient = (): Client => {
    return React.useContext(ClientContext) as Client;
};

// @description client context provider
export const ClientProvider = ({ children }: PropsWithChildren): JSX.Element => {
    const [ token, setToken, removeToken ] = useLocalStorage<string>(SESSION_KEY, "");
    const api = useApi(token);

    // api to access to the REST API
    const client: Client = React.useMemo(() => ({
        token: token as string,
        logout: () => {
            removeToken();
        },
        login: (credentials = {}) => {
            return api("POST", "/_login", credentials).then(responseData => {
                if (responseData?.token) {
                    setToken(responseData.token);
                }
            });
        },
        config: () => {
            return api("GET", "/_config");
        },
        graphql: (query, variables) => {
            return api("POST", "/_graphql", { query, variables });
        },
        getAuthenticatedUser: () => {
            return api("GET", "/_user");
        },
        getUserPreferences: () => {
            return api("GET", "/_user/preferences").then((preferences: any) => {
                return (preferences || {}) as Partial<Preferences>;
            });
        },
        updateUserPreferences: (preferences: Partial<Preferences>) => {
            return api("POST", "/_user/preferences", preferences || {});
        },
    }), [ token, setToken, removeToken ]);

    return (
        <ClientContext.Provider value={client}>
            {children}
        </ClientContext.Provider>
    );
};
