import React from "react";

export type ApiClient = (method: string, path: string, data?: any) => Promise<any>;

// internal method to reject the promise with a standardized error format
const rejectResponse = (response: any): Promise<Error> => {
    if (response && Array.isArray(response.errors) && response.errors[0]?.message) {
        return Promise.reject(new Error(response.errors[0].message));
    }
    // generic error if the response is not in the expected format
    return Promise.reject(new Error("An error occurred while processing the request."));
};

export const useApi = (token?: string): ApiClient => {
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
        return fetch(path, options)
            .then(response => {
                // if the response is not ok, we throw an error
                if (!response.ok) {
                    // try to parse the response as JSON to get the errors
                    return response.json().then(responseData => {
                        return rejectResponse(responseData);
                    });
                }
                // if the response is ok, we return the response as JSON
                return response.json();
            })
            .then(responseData => {
                // if there is a field named "errors" in the response, we reject the promise
                // this is a common pattern in GraphQL responses, but can also be used in REST
                if (responseData.errors) {
                    return rejectResponse(responseData);
                }
                // return the response object to process
                return responseData;
            });
    }, [token]);
};
