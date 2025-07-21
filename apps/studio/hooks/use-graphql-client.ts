import React from "react";
import { useApiClient } from "./use-api-client.ts";

export type GraphqlClient = (query: string, variables: any) => Promise<any>;

export const useGraphqlClient = (token: string, path: string): GraphqlClient => {
    const api = useApiClient(token);
    return React.useCallback((query: string, variables: any): Promise<any> => {
        return api("POST", path || "/_graphql", {query, variables}).then(response => {
            if (response.errors) {
                return Promise.reject(response);
            }
            // return response data
            return response.data;
        });
    }, [api, path]);
};
