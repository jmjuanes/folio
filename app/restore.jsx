import React from "react";
import {createRoot} from "react-dom/client";
import {ClientProvider, useClient} from "./contexts/client.jsx";

const RestoreApp = () => {
    const client = useClient();
    const [state, setState] = React.useState({loading: true});

    // On init, get client data and allow users to download a .folio file
    React.useEffect(() => {
        client.data.get().then(data => {
            console.log(data);
        });
    }, []);

    return (
        <div>Loading data...</div>
    );
};

createRoot(document.getElementById("root")).render((
    <ClientProvider>
        <RestoreApp />
    </ClientProvider>
));
