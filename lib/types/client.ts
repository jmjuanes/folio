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
    connect: (credentials?: any) => Promise<void>;
    close: () => Promise<void>;
    list(): Promise<Entry[]>;
    get(id: string): Promise<Entry>;
    create(id: string, data: Entry): Promise<void>;
    update(id: string, data: Entry): Promise<void>;
    delete(id: string): Promise<void>;
};

export type ClientFactory = (options: any) => Client;
