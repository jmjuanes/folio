import type { User } from "./user.ts";

export type AuthContext = {
    authenticate: (token: string) => Promise<User|null>;
};
