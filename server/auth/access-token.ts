import { generateToken } from "../token.ts";
import { createLogger } from "../utils/logger.ts";
import type { AccessTokenAuthConfig } from "../config.ts";
import type { AuthContext } from "../types/authentication.ts";
import type { User } from "../types/user.ts";

const { info } = createLogger("folio:auth");

const ACCESS_TOKEN_LENGTH = 24;
const ACCESS_USERNAME = "folio";

// create an authentication method based on access-tokens
export const createAccessTokenAuth = async (authConfig: AccessTokenAuthConfig): Promise<AuthContext> => {
    // use the access token provided via configuration
    // or generate a token each time server is restarted
    const accessToken = authConfig?.token || generateToken(ACCESS_TOKEN_LENGTH);
    const username = authConfig?.username || ACCESS_USERNAME;

    // print login information in logs
    info(`Using Access Token as authentication method.`);
    info(`Use '${accessToken}' to login.`);

    return {
        authenticate: async (requestBody: any): Promise<User|null> => {
            if (requestBody?.token && requestBody.token === accessToken) {
                return {
                    username: username,
                };
            }
            // authentication not valid
            return null;
        },
        getUser: async (username: string): Promise<User|null> => {
            return {
                username: username,
                name: username,
                display_name: authConfig?.display_name || username,
                avatar_url: authConfig?.avatar_url || null,
                initials: (authConfig?.display_name || username)[0].toUpperCase(),
                color: "#000000",
            };
            return null;
        },
    };
};
