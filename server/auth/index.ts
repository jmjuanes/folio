import { createAccessTokenAuth } from "./access-token.ts";
import type { AuthContext } from "../types/authentication.ts";
import type { Config, AuthConfig} from "../config.ts";

export const createAuth = async (config: Config): Promise<AuthContext> => {
    const authConfig = config?.authentication as AuthConfig;
    let auth = null as AuthContext;

    if (authConfig?.accessToken) {
        auth = await createAccessTokenAuth(authConfig.accessToken);
    }

    // return the auth instance
    return auth;
};
