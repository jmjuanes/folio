import { createApiClient } from "../api.ts";
import { TOKEN_KEY } from "../../constants.ts";
import type { ClientFactory } from "../types/client.ts";

export type KeyvalOptions = {
    authenticationHost: string;
    storageHost: string;
};

export const createKeyvalClient: ClientFactory = (options: KeyvalOptions) =>  {
    const token: { current: string | null } = { current: null };
    const storageApi = createApiClient(options.storageHost, {
        prepareOptions: requestOptions => {
            // const token = window.localStorage.getItem(TOKEN_KEY) || null;
            if (typeof token.current === "string" && token.current) {
                (requestOptions.headers as Record<string, string>)["Authorization"] = `Bearer ${token.current}`;
            }
        },
    });
    return {
        fields: {
            token: {
                type: "text",
                required: true,
                label: "Authentication token",
                description: "Your access token is printed in the terminal where you run the server. If you don't have it, please contact your administrator.",
            },
        },
        validateCredentials: (credentials: any) => {
            return new Promise((resolve, reject) => {
                if (!credentials?.token) {
                    return reject(new Error("Invalid token"));
                }
                return resolve();
            });
        },
        // recover the session saved by a previous connection
        resume: async () => {
            const savedToken = window.localStorage.getItem(TOKEN_KEY);
            if (!savedToken) {
                return false;
            }
            token.current = savedToken;
            try {
                await storageApi("GET", "/");
                return true;
            }
            catch (error) {
                // the saved token is not valid anymore
                token.current = null;
                window.localStorage.removeItem(TOKEN_KEY);
                return false;
            }
        },
        connect: async (credentials: any) => {
            const authenticationApi = createApiClient(options.authenticationHost);
            const response = await authenticationApi("POST", "/login", credentials);
            if (response?.token) {
                token.current = response.token;
                window.localStorage.setItem(TOKEN_KEY, response.token);
                return Promise.resolve();
            }
            // no token returned in response, send as error
            return Promise.reject(new Error("Invalid login credentials"));
        },
        close: async () => {
            token.current = null;
            window.localStorage.removeItem(TOKEN_KEY);
        },
        list: () => {
            return storageApi("GET", "/");
        },
        create: (id: string, data: any) => {
            return storageApi("POST", "/", { ...data, id: id });
        },
        get: (id: string) => {
            return storageApi("GET", `/${id}`);
        },
        update: (id: string, data: any) => {
            return storageApi("PATCH", `/${id}`, data);
        },
        delete: (id: string) => {
            return storageApi("DELETE", `/${id}`);
        },
    };
};
