export type ProfileClientConfig = {
    type: "keyval" | "local";
    id?: string;
    label: string;
    options: Record<string, any>;
};

export type Profile = {
    name?: string;
    config?: object | (() => Promise<object>);
    clients: ProfileClientConfig[];
};
