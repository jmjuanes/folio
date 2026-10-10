import { useState, useEffect, createContext, useContext, useMemo, useCallback } from "react";
import { Loading } from "folio-react/components/loading.jsx";
import { useClients } from "./Clients.tsx";
import { TOKEN_KEY } from "../constants.ts";
import type { JSX, PropsWithChildren } from "react";
import type { AuthenticatedUser } from "../lib/clients/types.ts";

// authentication type
export type Authentication = {
    user: AuthenticatedUser | null;
    isAuthenticated: () => boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
};

// authentication context
export const AuthenticationContext = createContext<Authentication>({} as Authentication);

// hook to manage authentication
export const useAuthentication = (): Authentication => {
    return useContext(AuthenticationContext);
};

// hook to access to the authenticated user
export const useAutenticatedUser = (): any => {
    return useContext(AuthenticationContext)?.user;
};

// main authentication provider
export const AuthenticationProvider = (props: PropsWithChildren): JSX.Element => {
    const clients = useClients();
    const [token, setToken] = useState<string | null>(() => window.localStorage.getItem(TOKEN_KEY));
    const [user, setUser] = useState<AuthenticatedUser | null>(null);
    // loading screen is only displayed while resolving the initial session
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // resolve the user every time the token changes
    useEffect(() => {
        let cancelled = false;
        if (clients.authentication && token) {
            clients.authentication.getAuthenticatedUser()
                .then((data: AuthenticatedUser) => {
                    if (!cancelled) {
                        setUser(data);
                    }
                })
                .catch((error: any) => {
                    console.error(error);
                    if (!cancelled) {
                        clients.authentication?.logout();
                        setToken(null);
                        setUser(null);
                    }
                })
                .finally(() => {
                    if (!cancelled) {
                        setIsLoading(false);
                    }
                });
        }
        else {
            setUser(null);
            setIsLoading(false);
        }
        return () => {
            cancelled = true;
        };
    }, [clients.authentication, token]);

    const login = useCallback(async (credentials: any) => {
        await clients.authentication?.login(credentials);
        // the client stores the token, we just sync our copy to trigger the effect above
        setToken(window.localStorage.getItem(TOKEN_KEY));
    }, [clients.authentication]);

    const logout = useCallback(async () => {
        await clients.authentication?.logout();
        setToken(null);
        setUser(null);
    }, [clients.authentication]);

    const authentication = useMemo<Authentication>(() => {
        return {
            user: user,
            isAuthenticated: () => !!user,
            login: login,
            logout: logout,
        };
    }, [user, login, logout]);

    if (isLoading) {
        return (
            <Loading className="w-full h-full" />
        );
    }

    return (
        <AuthenticationContext value={authentication}>
            {props.children}
        </AuthenticationContext>
    );
};
