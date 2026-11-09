import { createLocalClient } from "./local.ts";
import { createKeyvalClient } from "./keyval.ts";
import type { ClientFactory } from "../types/client.ts";

export const clientsFactory: Record<string, ClientFactory> = {
    "local": createLocalClient,
    "keyval": createKeyvalClient,
};

// export const createClient = (type: string, options: any): Promise<Client> => {
//     return factory[type](options);
// };
