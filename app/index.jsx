import React from "react";
import {createRoot} from "react-dom/client";
import Rouct from "rouct";

import {ConfirmProvider} from "./contexts/ConfirmContext.jsx";
import {ClientProvider} from "./contexts/ClientContext.jsx";
import {ToastProvider} from "./contexts/ToastContext.jsx";

import {Editor} from "./pages/index.jsx";
import {Toaster} from "./components/Toaster.jsx";
import {Confirm} from "./components/Confirm.jsx";

const App = () => (
    <ToastProvider>
        <ConfirmProvider>
            <ClientProvider render={() => (
                <Rouct.Router routing={Rouct.HashbangRouting}>
                    <Rouct.Route path="/:id" render={request => (
                        <Editor
                            key={request.pathname}
                            id={request.params?.id}
                        />
                    )} />
                </Rouct.Router>
            )} />
            <Confirm />
        </ConfirmProvider>
        <Toaster />
    </ToastProvider>
);

// Mount app
createRoot(document.getElementById("root")).render(<App />);
