import { generateToken } from "../token.ts";
import type { AccessTokenAuthConfig } from "../config.ts";
import type { AuthContext, AuthPayload } from "../types/authentication.ts";

const ACCESS_TOKEN_LENGTH = 24;
const ACCESS_USER = "folio";

// create an authentication method based on access-tokens
export const createAccessTokenAuth = async (authConfig: AccessTokenAuthConfig): Promise<AuthContext> => {
    // use the access token provided via configuration
    // or generate a token each time server is restarted
    const accessToken = authConfig?.token || generateToken(ACCESS_TOKEN_LENGTH);

    return {
        validate: async (token: string) => {
            if (token === accessToken) {
                return {
                    userId: authConfig?.user || ACCESS_USER,
                };
            }
            // authentication not valid
            return null;
        }, 
    };
};
