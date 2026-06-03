import { createAccessTokenAuth } from "./access-token.ts";
import { createLogger } from "../utils/logger.ts";
import { AuthenticationTypes } from "../config.js";
import type { AuthContext } from "../types/authentication.ts";
import type { Config } from "../config.js";

const { debug, error } = createLogger("folio:auth");

export const createAuth = async (config: Config): Promise<AuthContext> => {
    // check if access token has been configured as the authentication method
    if (config?.authentication === AuthenticationTypes.ACCESS_TOKEN) {
        debug("using access_token as authentication method");
        return createAccessTokenAuth(config);
    }

    // not valid authentication method --> stop server
    error("No valid authentication method configured");
    process.exit(1);
};
