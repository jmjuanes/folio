import { useMemo, createContext, useContext } from "react";
import profile from "@profile";
import { clientsFactory } from "../lib/clients/index.ts";
import type { PropsWithChildren, JSX } from "react";
import type { Client } from "../lib/types/client.ts";
import type { ProfileClientConfig } from "../lib/types/profile.ts";

export type ClientEntry = {
    id: string;
    label: string;
    client: Client;
};

// cloud service context
export const ClientsContext = createContext<ClientEntry[]>([]);

// hook to access to clients
export const useClients = () => {
    return useContext(ClientsContext);
};

// main clients provider
export const ClientsProvider = (props: PropsWithChildren): JSX.Element =>  {
    const clients = useMemo(() => {
        return profile.clients.map((entry: ProfileClientConfig) => {
            const factory = clientsFactory[entry.type];
            if (!factory) {
                throw new Error(`Unknown client type: ${entry.type}`);
            }
            return {
                id: entry.id || entry.type,
                label: entry.label,
                client: factory(entry.options || {}),
            };
        });
    }, [profile]);
    
    return (
        <ClientsContext value={clients}>
            {props.children}
        </ClientsContext>
    );
};
