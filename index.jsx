import React from "react";
import {createRoot} from "react-dom/client";
import {RouterProvider} from "./contexts/RouterContext.jsx";
import {ClientProvider} from "./contexts/ClientContext.jsx";
import {ConfirmProvider} from "./contexts/ConfirmContext.jsx";
import {App} from "./components/App.jsx";

import "lowcss/dist/low.css";

// Mount app component
createRoot(document.getElementById("root")).render((
    <RouterProvider>
        <ClientProvider>
            <ConfirmProvider>
                <App />
            </ConfirmProvider>
        </ClientProvider>
    </RouterProvider>
));
