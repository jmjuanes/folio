import type { User } from "./user.ts";

export type AuthContext = {
    authenticate: (requestBody: any) => Promise<User|null>;
};
