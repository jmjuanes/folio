import React from "react";
import {createRoot} from "react-dom/client";
import {ConfirmProvider} from "folio-react/contexts/confirm.jsx";
import {App} from "./components/app.jsx";
import {ClientProvider} from "./contexts/client.jsx";
import {AuthenticationProvider} from "./contexts/authentication.jsx";
import {RouterProvider} from "./contexts/router.jsx";

createRoot(document.getElementById("root")).render((
    <RouterProvider>
        <ClientProvider>
            <AuthenticationProvider>
                <ConfirmProvider>
                    <App />
                </ConfirmProvider>
            </AuthenticationProvider>
        </ClientProvider>
    </RouterProvider>
));
