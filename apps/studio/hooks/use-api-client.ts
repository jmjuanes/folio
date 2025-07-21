import React from "react";

export type ApiClient = (method: String, path: string, data: any) => Promise<any>;

export const useApiClient = (token: string): ApiClient => {
    return React.useCallback((method = "GET", path = "", data = null) => {
        // construct the URL based on the base URL and path
        const url = `/api${path}`;
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
};
