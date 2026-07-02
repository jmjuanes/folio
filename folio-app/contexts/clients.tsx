import { useState, useEffect, createContext, useContext } from "react";
import profile from "@profile";
import { createLocalStorageClient } from "../clients/local.ts";
import { createRemoteStorageClient } from "../clients/remote.ts";
import type { PropsWithChildren, JSX } from "react";
import type { StorageClient } from "../types/clients";

export type Clients = {
    localStorage?: StorageClient | null;
    remoteStorage?: StorageClient | null;
    authentication?: null;
};

// create clients from profile
const createClientsFromProfile = async (): Promise<Clients> => {
    const clients: Clients = {
        localStorage: null,
        remoteStorage: null,
    };
    // initialize local storage client
    if (profile?.services?.localStorage) {
        clients.localStorage = await createLocalStorageClient(profile.services.localStorage);
    }
    // initialize remote storage client
    if (profile?.services?.remoteStorage) {
        clients.remoteStorage = await createRemoteStorageClient(profile.services.remoteStorage);
    }
    return Promise.resolve(clients);
};

// cloud service context
export const ClientsContext = createContext<Clients>({});

// hook to access to clients
export const useClients = (): Clients => {
    return useContext(ClientsContext);
};

// main clients provider
export const ClientsProvider = (props: PropsWithChildren): JSX.Element =>  {
    const [clients, setClients] = useState<Clients | null>(null);

    // initialize clients
    useEffect(() => {
        createClientsFromProfile().then(initialClients => {
            setClients(initialClients);
        });
    }, []);

    // if service is defined and is not initialized, display a loading screen
    if (!clients) {
        return (
            <div>Loading...</div>
        );
    }
    
    return (
        <ClientsContext.Provider value={clients}>
            {props.children}
        </ClientsContext.Provider>
    );
};
