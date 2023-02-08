import React from "react";
import {createLocalClient} from "../clients/local.js";
import {useDelay} from "../hooks/useDelay.js";
import {Loading} from "../components/Loading.jsx";

export const ClientContext = React.createContext({});

export const useClient = () => {
    return React.useContext(ClientContext);
};

export const ClientProvider = props => {
    const [ready, setReady] = React.useState(false);
    const client = React.useRef(null);

    useDelay(props.delay, () => {
        client.current = createLocalClient();
        setReady(true);
    });

    return (
        <ClientContext.Provider value={client.current}>
            {!ready && (
                <Loading />
            )}
            {/* Render content only when ready */}
            {ready && props.render(client.current)}
        </ClientContext.Provider>
    );
};

ClientProvider.defaultProps = {
    delay: 2000,
    render: null,
};
