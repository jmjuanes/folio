import { createAccessTokenAuth } from "./access-token.ts";
import { createLogger } from "../utils/logger.ts";
import type { AuthContext } from "../types/authentication.ts";
import type { Config, AuthConfig } from "../config.ts";

const { debug, error } = createLogger("folio:auth");

export const createAuth = async (config: Config): Promise<AuthContext> => {
    const authConfig = config?.authentication as AuthConfig;
    let auth = null as AuthContext;

    // check if access token has been configured as the authentication method
    if (authConfig?.access_token) {
        debug("using access_token as authentication method");
        auth = await createAccessTokenAuth(authConfig.access_token);
    }
    else {
        error("No valid authentication method configured");
        process.exit(1);
    }

    // return the auth instance
    return auth;
};
