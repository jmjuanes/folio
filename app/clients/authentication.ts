import { createApiClient } from "../lib/api.ts";
import { TOKEN_KEY } from "../constants.ts";
import type { AuthenticationClient, Credentials } from "../types/clients.ts";
import type { AuthenticationConfig } from "../types/profile.ts";

export const createAuthenticationClient = (config: AuthenticationConfig) => {
    const api = createApiClient(config.host);
    return Promise.resolve({
        login: async (credentials: Credentials) => {
            const response = await api("POST", "/login", credentials);
            if (response?.token) {
                window.localStorage.setItem(TOKEN_KEY, response.token);
                return Promise.resolve();
            }
            // no token returned in response, send as error
            return Promise.reject(new Error("Invalid login credentials"));
        },
        logout: () => {
            window.localStorage.removeItem(TOKEN_KEY);
            return Promise.resolve();
        },
        getAuthenticatedUser: () => {
            // 1. check if token is saved in local storage and it has the correg structure
            const token = window.localStorage.getItem(TOKEN_KEY);
            if (!token || typeof token !== "string") {
                return Promise.reject(new Error("user is not logged"));
            }
            // 2. validate that this token can be used to perform requests to the auth api
            return api("GET", "/me");
        },
    } as AuthenticationClient);
};
