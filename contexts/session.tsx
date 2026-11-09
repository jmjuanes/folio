import { createContext, useContext, useEffect, useCallback, useMemo, useState } from "react";
import { Loading } from "folio-react/components/loading.jsx";
import { useClients } from "./clients.tsx";
import type { JSX, PropsWithChildren } from "react";
import type { ClientEntry } from "./clients.tsx";
import type { Client } from "../lib/types/client.ts";

const SESSION_KEY = "folio:session";

// session state: tracks the state of the connection
export type SessionState = {
    id: string | null;
    status: "idle" | "connecting" | "connected" | "error";
    error: null | any;
};

export type Session = {
    state: SessionState;
    client: Client | null;
    connect: (id: string, credentials: any) => Promise<void>;
    disconnect: () => Promise<void>;
};

const SessionContext = createContext<Session>({} as Session);

// @description hook to manage the session
export const useSession = (): Session => {
    return useContext(SessionContext);
};

// @description session provider
export const SessionProvider = (props: PropsWithChildren): JSX.Element => {
    const clients = useClients();
    const [state, setState] = useState<SessionState>({ id: null, status: "idle", error: null });
    const [loading, setLoading] = useState<boolean>(false);

    const connect = useCallback(async (id: string, credentials = {}) => {
        const entry = clients.find(client => client.id === id) as ClientEntry;
        if (entry) {
            setState({ id: null, status: "connecting", error: null });
            try {
                // await state.id && state.id !== id && entries.find(e => e.id === state.id)?.client.close();
                if (typeof entry.client.validateCredentials === "function") {
                    await entry.client.validateCredentials(credentials);
                }
                await entry.client.connect(credentials);
                window.localStorage.setItem(SESSION_KEY, JSON.stringify({ id, credentials }));
                setState({ id, status: "connected", error: null });
            } catch (error) {
                setState({ id: null, status: "error", error });
            }
        }
    }, [clients, setState]);

    const disconnect = useCallback(async () => {
        const entry = clients.find(client => client.id === state.id);
        await entry?.client.close();
        window.localStorage.removeItem(SESSION_KEY);
        setState({ id: null, status: "idle", error: null });
    }, [clients, state.id]);

    // get the initial client to connect
    const initialClient = useMemo<{ id: string; credentials: any } | null>(() => {
        const saved = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "{}");
        if (saved && saved?.id) {
            return saved;
        }
        // check if we have only one client to connect and it does not need any configuration
        else if (clients.length === 1) {
            const fields = Object.keys(clients[0].client?.fields || {});
            if (fields.length === 0) {
                return { id: clients[0].id, credentials: {} };
            }
        }
        // other case, no initial client to connect
        return null;
    }, [clients]);

    // silent reconnection after loading
    useEffect(() => {
        if (initialClient?.id) {
            setLoading(true); // display the loading splash
            connect(initialClient.id, initialClient.credentials).then(() => {
                setLoading(false); // hide loading splash
            });
        }
    }, [clients]);

    // get active client instance
    const activeClient = useMemo<Client | null>(() => {
        return clients.find(client => client.id === state.id)?.client || null;
    }, [state.id, clients]);

    // while we are reconnecting to the previous session, we will display the
    // loading splash instead
    if (loading) {
        return (
            <Loading className="w-full h-full" />
        );
    }

    return (
        <SessionContext.Provider value={{ state, connect, disconnect, client: activeClient }}>
            {props.children}
        </SessionContext.Provider>
    );
};

