import React from "react";
import {createRoot} from "react-dom/client";
import {RouterProvider} from "./contexts/RouterContext.jsx";
import {ClientProvider} from "./contexts/ClientContext.jsx";
import {App} from "./components/App.jsx";

// TODO: we need to remove this import and add a new styles.css file
import "lowcss/dist/low.css";

// Mount app component
createRoot(document.getElementById("root")).render((
    <RouterProvider>
        <ClientProvider>
            <App />
        </ClientProvider>
    </RouterProvider>
));
