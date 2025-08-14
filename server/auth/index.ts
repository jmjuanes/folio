import { createAccessTokenAuth } from "./access-token.ts";
import { createLogger } from "../utils/logger.ts";
import { AuthenticationTypes } from "../config.js";
import type { AuthContext } from "../types/authentication.ts";
import type { Config } from "../config.js";

const { debug, error } = createLogger("folio:auth");

export const createAuth = async (config: Config): Promise<AuthContext> => {
    let auth = null as AuthContext;

    // check if access token has been configured as the authentication method
    if (config?.authentication === AuthenticationTypes.ACCESS_TOKEN) {
        debug("using access_token as authentication method");
        auth = await createAccessTokenAuth(config);
    }
    else {
        error("No valid authentication method configured");
        process.exit(1);
    }

    // return the auth instance
    return auth;
};
