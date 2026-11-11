export type ProfileClientConfig = {
    type: "http" | "local";
    options: Record<string, any>;
};

export type Profile = {
    name?: string;
    config?: object | (() => Promise<object>);
    client: ProfileClientConfig;
};
