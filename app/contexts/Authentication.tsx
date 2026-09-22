import { useState, useEffect, createContext, useContext, useMemo } from "react";
import { Loading } from "folio-react/components/loading.jsx";
import { useClients } from "./Clients.tsx";
import { TOKEN_KEY } from "../constants.ts";
import * as sharedStyles from "../styles/shared.css";
import type { JSX, PropsWithChildren } from "react";
import type { AuthenticatedUser } from "../types/clients.ts";

// authentication type
export type Authentication = {
    user: AuthenticatedUser | null;
    isAuthenticated: () => boolean;
    refresh: () => void;
};

// authentication context
export const AuthenticationContext = createContext<Authentication>({} as Authentication);

// hook to manage authentication
export const useAuthentication = (): Authentication => {
    return useContext(AuthenticationContext);
};

// hook to access to authentication
export const useAutenticatedUser = (): any => {
    return useContext(AuthenticationContext)?.user;
};

// main authentication provider
export const AuthenticationProvider = (props: PropsWithChildren): JSX.Element =>  {
    const clients = useClients(); // get registered clients
    const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    // get current token from local storage
    // when token changes, this will ensure that the authentication is processed
    const token = window.localStorage.getItem(TOKEN_KEY);

    useEffect(() => {
        // setAuthenticatedUser(null);
        if (clients.authentication && !!token) {
            setIsLoading(true);
            clients.authentication?.getAuthenticatedUser()
                .then((data: AuthenticatedUser) => {
                    setAuthenticatedUser(data);
                })
                .catch((error: any) => {
                    console.error(error);
                    clients.authentication?.logout();
                    setAuthenticatedUser(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
        else {
            setIsLoading(false);
        }
    }, [clients.authentication, setAuthenticatedUser, setIsLoading, token]);

    // authentication manager
    const authentication = useMemo<Authentication>(() => {
        return {
            user: authenticatedUser,
            isAuthenticated: () => {
                return !!authenticatedUser;
            },
            refresh: () => {
                setAuthenticatedUser(null);
            },
        };
    }, [authenticatedUser, clients, isLoading]);

    // if we are currently getting user information, display a loading screen
    // before authentication is finished
    if (isLoading) {
        return (
            <Loading className={sharedStyles.loading} />
        );
    }

    return (
        <AuthenticationContext value={authentication}>
            {props.children}
        </AuthenticationContext>
    );
};
