import React from "react";

export type ApiClient = (method: String, path: string, data: any) => Promise<any>;

export const useApiClient = (token: string): ApiClient => {
    return React.useCallback((method: string, path: string, data: any): Promise<any> => {
        // construct the URL based on the base URL and path
        const options = {
            method: method || "GET",
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
        return fetch(path, options).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    }, [token]);
};
