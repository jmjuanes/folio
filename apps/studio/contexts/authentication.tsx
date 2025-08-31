import React from "react";
import { useLocalStorage } from "react-use";
import { Loading } from "folio-react/components/loading.jsx";
import { useApi } from "../hooks/use-api.ts";
import { Login } from "../components/login.tsx";

const SESSION_KEY = "folio-session";

// contains the information about the Session
export type Session = {
    token: string;
    destroy: () => void;
};

// the authentication context stores the 
export const AuthenticationContext = React.createContext<Session|null>(null);

// hook to get the information about the current session
export const useSession = (): Session|null => {
    return React.useContext(AuthenticationContext);
};

// @description provider component for the authentication context
export const AuthenticationProvider = ({ children }) => {
    const [ token, setToken, removeToken ] = useLocalStorage(SESSION_KEY);
    const [ sessionValid, setSessionValid ] = React.useState<Boolean>(false);
    const api = useApi();

    // hook to validate session
    React.useEffect(() => {
        // setSessionValid(false);
        if (token) {
            // TODO: we have to perform a query to the api to check if the session is valid
            setSessionValid(true);
        }
    }, [ token ]);

    // if token is not set, the user is not authenticated, so we have to display
    // the login screen
    if (!token) {
        return (
            <Login
                onLogin={(credentials: any): Promise<void> => {
                    return api("POST", "/_login", credentials).then(response => {
                        if (response?.data?.token) {
                            setToken(response.data.token);
                        }
                    });
                }}
            />
        );
    }

    // if the session has not been validated, display a loading screen
    if (!sessionValid) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loading />
            </div>
        );
    }

    return (
        <AuthenticationContext.Provider value={{ token, destroy: removeToken }}>
            {children}
        </AuthenticationContext.Provider>
    );
};
