// authentication payload
export type AuthPayload = {
    userId: string;
};

export type AuthContext = {
    validate: (token: string) => Promise<AuthPayload|null>;
};
