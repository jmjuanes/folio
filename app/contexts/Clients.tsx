import { useState, useEffect, createContext, useContext } from "react";
import profile from "@profile";
import { Loading } from "folio-react/components/loading.jsx";
import { createRemoteStorageClient, createLocalStorageClient } from "../clients/storage.ts";
import { createAuthenticationClient } from "../clients/authentication.ts";
import * as sharedStyles from "../styles/shared.css";
import type { PropsWithChildren, JSX } from "react";
import type { StorageClient, AuthenticationClient } from "../types/clients.ts";

export type Clients = {
    localStorage?: StorageClient | null;
    remoteStorage?: StorageClient | null;
    authentication?: AuthenticationClient | null;
};

// create clients from profile
const createClientsFromProfile = async (): Promise<Clients> => {
    const clients: Clients = {
        localStorage: null,
        remoteStorage: null,
        authentication: null,
    };
    // initialize storage client
    // note that at least a local or remote storage must be configured
    if (profile?.localStorage) {
        clients.localStorage = await createLocalStorageClient(profile.localStorage);
    }
    if (profile?.remoteStorage) {
        clients.remoteStorage = await createRemoteStorageClient(profile.remoteStorage);
    }
    // initialize authentication client
    if (profile?.authentication) {
        clients.authentication = await createAuthenticationClient(profile.authentication);
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

    // on mount, initialize clients
    useEffect(() => {
        createClientsFromProfile().then(initialClients => {
            setClients(initialClients);
        });
    }, []);

    // if clients are not initialized, display a loading screen
    if (!clients) {
        return (
            <Loading className={sharedStyles.loading} />
        );
    }
    
    return (
        <ClientsContext value={clients}>
            {props.children}
        </ClientsContext>
    );
};
