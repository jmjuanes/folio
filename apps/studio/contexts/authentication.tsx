import React from "react";
import { Loading } from "folio-react/components/loading.jsx";
import { useClient } from "./client.tsx";
import { Login } from "../components/login.tsx";

const GET_USER_QUERY = `
    query GetUser {
        user {
            name
        }
    }
`;

// contains the information about the authenticated user
export type AuthenticatedUser = {
    name: string;
};

// the authentication context saves information about the current
// authenticated user
export const AuthenticationContext = React.createContext<AuthenticatedUser|null>(null);

// @description get the information about the current authenticated user
export const useAuthenticatedUser = (): AuthenticatedUser|null => {
    return React.useContext(AuthenticationContext);
};

// @description provider component for the authentication context
export const AuthenticationProvider = ({ children }) => {
    const [user, setUser] = React.useState<AuthenticatedUser|null>(null);
    const client = useClient();

    React.useEffect(() => {
        setUser(null);
        if (client.token) {
            client.query(GET_USER_QUERY, {})
                .then(response => {
                    return setUser(response?.data?.user || null);
                })
                .catch(response => {
                    console.error("Failed to fetch user data: ", response);
                    client.logout();
                });
        }
    }, [client.token]);

    // if token is not set, the user is not authenticated, so we have to display
    // the login screen
    if (!client.token) {
        return <Login />;
    }

    // if the user is not authenticated, do not render the children
    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loading />
            </div>
        );
    }

    return (
        <AuthenticationContext.Provider value={user}>
            {children}
        </AuthenticationContext.Provider>
    );
};
