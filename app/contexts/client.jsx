import React from "react";
import {useMount} from "react-use";
import {DrawingIcon} from "@josemi-icons/react";
import createClient from "@folio/client";
import {Centered} from "../components/ui/centered.jsx";

const ClientContext = React.createContext(null);

export const useClient = () => {
    return React.useContext(ClientContext);
};

export const ClientProvider = props => {
    const [client, setClient] = React.useState(null);

    // On mount, create a new client instance and initialize it
    useMount(() => {
        const clientInstance = createClient();
        clientInstance.initialize().then(() => {
            setClient(clientInstance);
        });
    });

    // If client is not ready, display the loading window
    if (!client) {
        return (
            <Centered className="fixed h-full z-50">
                <div className="flex text-3xl text-neutral-950 rounded-lg p-2 border border-neutral-200">
                    <DrawingIcon />
                </div>
            </Centered>
        );
    }

    return (
        <ClientContext.Provider value={client}>
            {props.children}
        </ClientContext.Provider>
    );
};
