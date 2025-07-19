import { createAccessTokenAuth } from "./access-token.ts";
import type { AuthContext } from "../types/authentication.ts";
import type { Config, AuthConfig } from "../config.ts";

export const createAuth = async (config: Config): Promise<AuthContext> => {
    const authConfig = config?.authentication as AuthConfig;
    let auth = null as AuthContext;

    // check if access token has been configured as the authentication method
    if (authConfig?.access_token) {
        auth = await createAccessTokenAuth(authConfig.access_token);
    }

    // return the auth instance
    return auth;
};
