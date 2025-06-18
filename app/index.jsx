import React from "react";
import {createRoot} from "react-dom/client";
import {App} from "./components/app.jsx";
import {ClientProvider} from "./contexts/client.jsx";
import {AuthenticationProvider} from "./contexts/authentication.jsx";

createRoot(document.getElementById("root")).render((
    <ClientProvider>
        <AuthenticationProvider>
            <div>Hello world</div>
        </AuthenticationProvider>
    </ClientProvider>
));
