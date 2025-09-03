import React from "react";
import { createRoot } from "react-dom/client";
import { ConfirmProvider } from "folio-react/contexts/confirm.jsx";
import { DialogsProvider } from "folio-react/contexts/dialogs.jsx";
import { ClientProvider } from "./contexts/client.tsx";
import { ConfigurationProvider } from "./contexts/configuration.tsx";
import { RouterProvider } from "./contexts/router.tsx";
import { ToasterProvider } from "./contexts/toaster.tsx";
import { AppStateProvider } from "./contexts/app-state.tsx";
import { Authentication } from "./components/authentication.tsx";
import { App } from "./components/app.tsx";

createRoot(document.getElementById("root")).render((
    <ToasterProvider>
        <ClientProvider>
            <ConfigurationProvider>
                <Authentication>
                    <RouterProvider>
                        <AppStateProvider>
                            <DialogsProvider>
                                <ConfirmProvider>
                                    <App />
                                </ConfirmProvider>
                            </DialogsProvider>
                        </AppStateProvider>
                    </RouterProvider>
                </Authentication>
            </ConfigurationProvider>
        </ClientProvider>
    </ToasterProvider>
));
