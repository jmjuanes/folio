import React from "react";

export type ApiClient = (method: string, path: string, data?: any) => Promise<any>;

export const useApi = (token: string): ApiClient => {
    return React.useCallback<ApiClient>((method: string, path: string, data?: any): Promise<any> => {
        // construct the URL based on the base URL and path
        const options: RequestInit = {
            method: method || "GET",
            headers: {
                "Content-Type": "application/json",
            },
        };
        // include the Authorization header if token is set
        if (token) {
            (options.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
        }
        // include the body if method is POST or PATCH and data is provided
        if (data && (method === "POST" || method === "PATCH" || method === "PUT")) {
            options.body = JSON.stringify(data);
        }
        // perform the request
        return fetch(path, options).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    }, [token]);
};
