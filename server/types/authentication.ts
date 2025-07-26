import type { User } from "./user.ts";

export type Credentials = {
    // this is the token used by 'access_token' plugin
    token?: string;

    // generic authentication credentials
    username?: string;
    password?: string;
};

export type AuthContext = {
    authenticate: (credentials: Credentials) => Promise<User|null>;
    getUser: (username: string) => Promise<User|null>;
};
