import React from "react";
import { createRoot } from "react-dom/client";
import { ConfirmProvider } from "folio-react/contexts/confirm.jsx";
import { DialogsProvider } from "folio-react/contexts/dialogs.jsx";
import { ClientProvider } from "./contexts/client.tsx";
import { AuthenticationProvider } from "./contexts/authentication.tsx";
import { RouterProvider } from "./contexts/router.tsx";
import { App } from "./components/app.tsx";

createRoot(document.getElementById("root")).render((
    <ClientProvider>
        <AuthenticationProvider>
            <RouterProvider>
                <DialogsProvider>
                    <ConfirmProvider>
                        <App />
                    </ConfirmProvider>
                </DialogsProvider>
            </RouterProvider>
        </AuthenticationProvider>
    </ClientProvider>
));
