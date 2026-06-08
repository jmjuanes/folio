import { generateToken } from "./token.ts";
import { createLogger } from "./utils/logger.ts";

import type { Config } from "./config.ts";
import type { User } from "./types/user.ts";

export type Credentials = {
    // this is the token used by 'access_token' method
    token?: string;
};

// @description type of the token payload
export type TokenPayload = {
    username: string;
};

export type AuthContext = {
    authenticate: (credentials: Credentials) => Promise<string | null>;
    getUser: (username: string) => Promise<User | null>;
};

const { info } = createLogger("folio:auth");

const ACCESS_TOKEN_LENGTH = 24;
const ACCESS_TOKEN_USERNAME = "folio";

// create an authentication method based on access-tokens
export const createAccessTokenAuth = async (config: Config): Promise<AuthContext> => {
    // use the access token provided via configuration
    // or generate a token each time server is restarted
    const accessToken = config.access_token || generateToken(ACCESS_TOKEN_LENGTH);
    const username = config.user_name || ACCESS_TOKEN_USERNAME;

    // print login information in logs
    info(`Using Access Token as authentication method.`);
    info(`Use '${accessToken}' to login.`);

    return {
        authenticate: async (requestBody: any): Promise<string|null> => {
            if (requestBody?.token && requestBody.token === accessToken) {
                return username;
            }
            // authentication not valid
            return null;
        },
        getUser: async (username: string): Promise<User | null> => {
            return Promise.resolve({
                username: username,
                display_name: config.user_display_name || username,
                avatar_url: config.user_avatar_url || null,
                initials: (config.user_display_name || username)[0].toUpperCase(),
                color: "#000000",
            } as User);
        },
    } as AuthContext;
};

export const createAuth = async (config: Config): Promise<AuthContext> => {
    return createAccessTokenAuth(config);
    // let auth = null as AuthContext;

    // // check if access token has been configured as the authentication method
    // if (config?.authentication === AuthenticationTypes.ACCESS_TOKEN) {
    //     debug("using access_token as authentication method");
    //     auth = await createAccessTokenAuth(config);
    // }
    // else {
    //     error("No valid authentication method configured");
    //     process.exit(1);
    // }

    // // return the auth instance
    // return auth;
};

