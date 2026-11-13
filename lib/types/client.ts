export type Entry = {
    id?: string;
    value?: any;
    metadata?: {
        name?: string;
        created_at?: number;
        updated_at?: number;
    };
};

export type Field = {
    type: "text" | "password" | "url";
    label: string;
    required?: boolean;
    description?: string;
    placeholder?: string;
    defaultValue?: string;
};

export interface Client {
    fields: Record<string, Field>;
    validateCredentials?: (credentials: any) => Promise<void>;
    // optional: try to recover a previous session without asking anything to the user
    // (for example, from a saved token or a cookie session). It resolves to true if the client is connected.
    // Clients without fields and without resume() are connected automatically
    resume?: () => Promise<boolean>;
    connect: (credentials?: any) => Promise<void>;
    close: () => Promise<void>;
    list(): Promise<Entry[]>;
    get(id: string): Promise<Entry>;
    create(id: string, data: Entry): Promise<void>;
    update(id: string, data: Entry): Promise<void>;
    delete(id: string): Promise<void>;
};

export type ClientFactory = (options: any) => Client;
