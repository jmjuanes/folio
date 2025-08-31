import React from "react";
import { createRoot } from "react-dom/client";
import { ConfirmProvider } from "folio-react/contexts/confirm.jsx";
import { DialogsProvider } from "folio-react/contexts/dialogs.jsx";
import { ConfigurationProvider } from "./contexts/configuration.tsx";
import { AuthenticationProvider } from "./contexts/authentication.tsx";
import { RouterProvider } from "./contexts/router.tsx";
import { ToasterProvider } from "./contexts/toaster.tsx";
import { AppStateProvider } from "./contexts/app-state.tsx";
import { App } from "./components/app.tsx";

createRoot(document.getElementById("root")).render((
    <ToasterProvider>
        <ConfigurationProvider>
            <AuthenticationProvider>
                <RouterProvider>
                    <DialogsProvider>
                        <ConfirmProvider>
                            <AppStateProvider>
                                <App />
                            </AppStateProvider>
                        </ConfirmProvider>
                    </DialogsProvider>
                </RouterProvider>
            </AuthenticationProvider>
        </ConfigurationProvider>
    </ToasterProvider>
));
