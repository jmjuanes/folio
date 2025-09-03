import React from "react";
import { Loading } from "folio-react/components/loading.jsx";
import { useClient } from "../contexts/client.tsx";
import { Login } from "../components/login.tsx";
import { GET_USER } from "../graphql.ts";

// component that makes sure that the user is authenticated
export const Authentication = ({ children }) => {
    const [ sessionValid, setSessionValid ] = React.useState<Boolean>(false);
    const client = useClient();

    // hook to validate session
    // we have to perform a query to the api to check if the session is valid
    React.useEffect(() => {
        setSessionValid(false);
        if (client.token) {
            client.graphql(GET_USER, {})
                .then(() => setSessionValid(true))
                .catch(error => {
                    console.error(error);
                    client.logout();
                });
        }
    }, [ client.token ]);

    // if token is not set, the user is not authenticated, so we have to display
    // the login screen
    if (!client.token) {
        return (
            <Login />
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

    return children;
};
