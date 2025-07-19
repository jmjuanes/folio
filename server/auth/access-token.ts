import { generateToken } from "../token.ts";
import { createLogger } from "../utils/logger.ts";
import type { AccessTokenAuthConfig } from "../config.ts";
import type { AuthContext, AuthPayload } from "../types/authentication.ts";

const { log } = createLogger("folio:auth");

const ACCESS_TOKEN_LENGTH = 24;
const ACCESS_USER = "folio";

// create an authentication method based on access-tokens
export const createAccessTokenAuth = async (authConfig: AccessTokenAuthConfig): Promise<AuthContext> => {
    // use the access token provided via configuration
    // or generate a token each time server is restarted
    const accessToken = authConfig?.token || generateToken(ACCESS_TOKEN_LENGTH);

    // print login information in logs
    log(`======= Authentication =======`);
    log(`Using Access Token as authentication method.`);
    log(`Use '${accessToken}' to login.`);

    return {
        validate: async (token: string): Promise<AuthPayload|null> => {
            if (token === accessToken) {
                return {
                    id: authConfig?.user || ACCESS_USER,
                };
            }
            // authentication not valid
            return null;
        }, 
    };
};
