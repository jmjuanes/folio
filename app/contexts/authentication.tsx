import { useState, useEffect, createContext, useContext } from "react";
import { Outlet, useNavigate } from "react-router";
import { Loading } from "folio-react/components/loading.jsx";
import { useClients } from "./clients.tsx";
import { TOKEN_KEY } from "../constants.ts";
import { loadingWrapper } from "../index.css";

import type { JSX } from "react";
import type { AuthenticatedUser } from "../types/clients.ts";

// authentication context
export const AuthenticationContext = createContext<AuthenticatedUser>({} as AuthenticatedUser);

// hook to access to authentication
export const useAutenticatedUser = (): any => {
    return useContext(AuthenticationContext);
};

// main authentication provider
export const AuthenticationProvider = (): JSX.Element =>  {
    const [ authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);
    const clients = useClients();
    const navigate = useNavigate();

    // get token from local storage
    // this will ensure to validate the token when it changes
    const token = window.localStorage.getItem(TOKEN_KEY);

    useEffect(() => {
        setAuthenticatedUser(null);
        if (clients.authentication) {
            // TODO: check that the token exists and we can fetch the information about the authenticated user
            clients.authentication?.getAuthenticatedUser()
                .then((data: AuthenticatedUser) => {
                    setAuthenticatedUser(data);
                })
                .catch((error: any) => {
                    console.error(error);
                    clients.authentication?.logout();
                    navigate("/login");
                });
        }
    }, [clients.authentication, navigate, setAuthenticatedUser, token]);

    // if service is defined and is not initialized, display a loading screen
    if (!clients || !authenticatedUser) {
        return (
            <Loading className={loadingWrapper} />
        );
    }
    
    return (
        <AuthenticationContext value={authenticatedUser}>
            <Outlet />
        </AuthenticationContext>
    );
};
