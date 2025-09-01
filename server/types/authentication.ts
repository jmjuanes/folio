import type { User } from "./user.ts";

export type Credentials = {
    // this is the token used by 'access_token' plugin
    token?: string;

    // generic authentication credentials
    username?: string;
    password?: string;
};

// @description type of the token payload
export type TokenPayload = {
    username: string;
};

// @description user payload: this is the accepted object type when
// updating the user information
export type UserPayload = {
    display_name?: string;
};

export type AuthContext = {
    authenticate: (credentials: Credentials) => Promise<string|null>;
    getUser: (username: string) => Promise<User|null>;
};
