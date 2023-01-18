import React from "react";
import {createLocalClient} from "../clients/local.js";

export const ClientContext = React.createContext({});

export const useClient = () => {
    return React.useContext(ClientContext);
};

export const ClientProvider = props => {
    const client = React.useRef(null);
    if (!client.current) {
        client.current = createLocalClient();
    }

    return (
        <ClientContext.Provider value={client.current}>
            {props.children}
        </ClientContext.Provider>
    );
};

