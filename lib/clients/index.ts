import { createLocalClient } from "./local.ts";
import { createHttpClient } from "./http.ts";
import type { Profile } from "../types/profile.ts";
import type { Client, ClientFactory } from "../types/client.ts";

export const clientsFactory: Record<string, ClientFactory> = {
    "local": createLocalClient,
    "http": createHttpClient,
};

// create the client of this installation from the profile
// each installation has one single client, but the rest of the app only talks to the
// Client interface, so any other kind of storage can be added to the factory
export const createClientFromProfile = (profile: Profile): Client => {
    const config = profile.client;
    const factory = clientsFactory[config.type];
    if (!factory) {
        throw new Error(`Unknown client type: ${config.type}`);
    }
    return factory(config.options || {});
};
