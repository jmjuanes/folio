import React from "react";
import {useLocalStorage} from "react-use";

// main client context
const ClientContext = React.createContext({});

// @description hook to get the client context
export const useClient = () => {
    return React.useContext(ClientContext);
};

// @description client context provider
export const ClientProvider = props => {
    const [token, setToken, removeToken] = useLocalStorage(props.sessionKey || "folio-session");

    // internal method to call the REST API
    const api = React.useCallback((method = "GET", path = "", data = null) => {
        // construct the URL based on the base URL and path
        // const baseUrl = process.env.API_BASE_URL || "/api"; // Use environment variable or default to /api
        const url = `${process.env.API_BASE_URL}${path}`;
        const options = {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
        };
        // include the Authorization header if token is set
        if (token) {
            options.headers["Authorization"] = `Bearer ${token}`;
        }
        // include the body if method is POST or PATCH and data is provided
        if (data && (method === "POST" || method === "PATCH")) {
            options.body = JSON.stringify(data);
        }
        // perform the request
        return fetch(url, options).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    }, [token]);

    // api to access to the REST API
    const client = React.useMemo(() => ({
        token: token,
        logout: () => removeToken(),
        login: accessToken => {
            return api("POST", "/login", {token: accessToken}).then(data => {
                setToken(data.token);
            });
        },
        getUser: () => {
            return api("GET", "/user");
        },
        getUserBoards: () => {
            return api("GET", "/user/boards");
        },
    }), [token, setToken, removeToken]);

    return (
        <ClientContext.Provider value={client}>
            {props.children}
        </ClientContext.Provider>
    );
};
