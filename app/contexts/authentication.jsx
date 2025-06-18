import React from "react";
import {useClient} from "./client.jsx";
import {Loading} from "folio-react/components/loading.jsx";
import {Login} from "../components/login.jsx";

// the authentication context saves information about the current
// authenticated user
export const AuthenticationContext = React.createContext(null);

// @description get the information about the current authenticated user
export const useAuthenticatedUser = () => {
    return React.useContext(AuthenticationContext);
};

// @description provider component for the authentication context
export const AuthenticationProvider = ({children}) => {
    const [user, setUser] = React.useState(null);
    const client = useClient();

    React.useEffect(() => {
        setUser(null);
        if (client.token) {
            client.getUser()
                .then(userData => setUser(userData))
                .catch(error => {
                    console.error("Failed to fetch user data:", error);
                    client.logout();
                });
        }
    }, [client.token]);

    // if token is not set, the user is not authenticated, so we have to display
    // the login screen
    if (!client.token) {
        return <Login />;
    }

    // if the user is not authenticated, show a loading state
    if (!user) {
        return <Loading />;
    }

    return (
        <AuthenticationContext.Provider value={user}>
            {children}
        </AuthenticationContext.Provider>
    );
};
