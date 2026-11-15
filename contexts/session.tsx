import { createContext, useContext, useEffect, useCallback, useMemo, useState } from "react";
import profile from "@profile";
import { Loading } from "folio-react/components/loading.jsx";
import { createClientFromProfile } from "../lib/clients/index.ts";
import type { JSX, PropsWithChildren } from "react";
import type { Client } from "../lib/types/client.ts";

// restoring: looking for a previous session when the app starts
// disconnected: waiting for the user to provide the credentials
// connecting: credentials sent, waiting for the client
// connected: the client is ready to be used
export type SessionStatus = "restoring" | "disconnected" | "connecting" | "connected";

export type Session = {
    status: SessionStatus;
    error: Error | null;
    // fields requested by the client of this installation to connect
    fields: Record<string, any>;
    // client instance, only available when the session is connected
    client: Client | null;
    connect: (credentials?: any) => Promise<void>;
    disconnect: () => Promise<void>;
};

const SessionContext = createContext<Session>({} as Session);

// @description hook to manage the session
export const useSession = (): Session => {
    return useContext(SessionContext);
};

// try to restore a previous session without asking anything to the user
// a client can implement resume() to decide it (for example, checking a cookie session).
// Clients that do not need any input connect automatically
const resumeSession = async (client: Client): Promise<boolean> => {
    if (typeof client.resume === "function") {
        return client.resume();
    }
    // if no fields are required for configuring the client, continue
    if (Object.keys(client.fields).length === 0) {
        return Promise.resolve(true);
    }
    // other case, resume can not be performed
    return Promise.resolve(false);
};

// @description session provider
export const SessionProvider = (props: PropsWithChildren): JSX.Element => {
    const client = useMemo(() => createClientFromProfile(profile), []);
    const [status, setStatus] = useState<SessionStatus>("restoring");
    const [error, setError] = useState<Error | null>(null);

    // silent reconnection after loading
    useEffect(() => {
        let cancelled = false;
        resumeSession(client).then(resumed => {
            if (!cancelled) {
                setStatus(resumed ? "connected" : "disconnected");
            }
        });
        return () => {
            cancelled = true;
        };
    }, [client]);

    const connect = useCallback(async (credentials: any = {}) => {
        setStatus("connecting");
        setError(null);
        try {
            if (typeof client.validateCredentials === "function") {
                await client.validateCredentials(credentials);
            }
            await client.connect(credentials);
            // window.localStorage.setItem(SESSION_KEY, JSON.stringify({ credentials }));
            setStatus("connected");
        }
        catch (error: any) {
            setError(error);
            setStatus("disconnected");
        }
    }, [client]);

    const disconnect = useCallback(async () => {
        await client.close();
        // window.localStorage.removeItem(SESSION_KEY);
        setStatus("disconnected");
    }, [client]);

    const session = useMemo<Session>(() => ({
        status: status,
        error: error,
        fields: client.fields || {},
        client: status === "connected" ? client : null,
        connect: connect,
        disconnect: disconnect,
    }), [status, error, client, connect, disconnect]);

    // while we are looking for a previous session, display the loading splash
    if (status === "restoring") {
        return (
            <Loading className="w-full h-full" />
        );
    }

    return (
        <SessionContext.Provider value={session}>
            {props.children}
        </SessionContext.Provider>
    );
};
