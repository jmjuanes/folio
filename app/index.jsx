import React from "react";
import {createRoot} from "react-dom/client";
import {ConfirmProvider} from "folio-react/contexts/confirm.jsx";
import {ClientProvider} from "./contexts/client.jsx";
import {AuthenticationProvider} from "./contexts/authentication.jsx";
import {RouterProvider} from "./contexts/router.jsx";
import {App} from "./components/app.jsx";

createRoot(document.getElementById("root")).render((
    <ClientProvider>
        <AuthenticationProvider>
            <RouterProvider>
                <ConfirmProvider>
                    <App />
                </ConfirmProvider>
            </RouterProvider>
        </AuthenticationProvider>
    </ClientProvider>
));
