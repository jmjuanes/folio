import React from "react";
import {createRoot} from "react-dom/client";
import {ConfirmProvider} from "folio-react/contexts/confirm.jsx";
import {ClientProvider} from "./contexts/client.jsx";
import {AuthenticationProvider} from "./contexts/authentication.jsx";
import {AppProvider} from "./contexts/app.jsx";
import {SidebarLayout} from "./layouts/sidebar.jsx";
import {Routes} from "./routes.jsx";

createRoot(document.getElementById("root")).render((
    <ClientProvider>
        <AuthenticationProvider>
            <ConfirmProvider>
                <AppProvider>
                    <SidebarLayout>
                        <Routes />
                    </SidebarLayout>
                </AppProvider>
            </ConfirmProvider>
        </AuthenticationProvider>
    </ClientProvider>
));
