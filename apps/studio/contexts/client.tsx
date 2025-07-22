import React from "react";
import { useLocalStorage } from "react-use";
import { useApiClient } from "../hooks/use-api-client.ts";
import { useGraphqlClient } from "../hooks/use-graphql-client.ts";
import {
    CREATE_BOARD_QUERY,
    DELETE_BOARD_QUERY,
    GET_BOARD_QUERY,
    GET_BOARDS_QUERY,
    GET_USER_QUERY,
    UPDATE_BOARD_QUERY,
} from "../constants.ts";

export type Client = {
    token: string;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
    getUser: () => Promise<any>;
    getBoards: () => Promise<any>;
    getBoard: (id: string) => Promise<any>;
    createBoard: (content: string) => Promise<any>;
    updateBoard: (id: string, content: string) => Promise<any>;
    deleteBoard: (id: string) => Promise<any>;
};

// main client context
const ClientContext = React.createContext({}) as any;

// @description hook to get the client context
export const useClient = (): Client => {
    return React.useContext(ClientContext) as Client;
};

// @description client context provider
export const ClientProvider = ({ children }) => {
    const [token, setToken, removeToken] = useLocalStorage(props.sessionKey || "folio-session");
    const api = useApiClient(token);
    const graphql = useGraphqlClient(token, "/_graphql");

    // api to access to the REST API
    const client: Client = React.useMemo(() => ({
        token: token,
        logout: () => removeToken(),
        login: (credentials: any): Promise<void> => {
            return api("POST", "/_login", credentials || {}).then(data => {
                setToken(data.token);
            });
        },
        getUser: (): Promise<any> => {
            return graphql(GET_USER_QUERY, {});
        },
        getBoards: (): Promise<any> => {
            return graphql(GET_BOARDS_QUERY, {});
        },
        createBoard: (content: string): Promise<any> => {
            return graphql(CREATE_BOARD_QUERY, { content });
        },
        getBoard: (id: string): Promise<any> => {
            return graphql(GET_BOARD_QUERY, { id });
        },
        updateBoard: (id: string, content: string): Promise<any> => {
            return graphql(UPDATE_BOARD_QUERY, { id, content });
        },
        deleteBoard: (id: string): Promise<any> => {
            return graphql(DELETE_BOARD_QUERY, { id });
        },
    }), [token, setToken, removeToken]);

    return (
        <ClientContext.Provider value={client}>
            {children}
        </ClientContext.Provider>
    );
};
