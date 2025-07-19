// authentication payload
export type AuthPayload = {
    id: string;
};

export type AuthContext = {
    validate: (token: string) => Promise<AuthPayload|null>;
};
