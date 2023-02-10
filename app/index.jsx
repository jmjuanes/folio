import React from "react";
import {createRoot} from "react-dom/client";

import {ConfirmProvider} from "./contexts/ConfirmContext.jsx";
import {ToastProvider} from "./contexts/ToastContext.jsx";

import {Editor} from "./components/Editor.jsx";
import {Toaster} from "./components/Toaster.jsx";
import {Confirm} from "./components/Confirm.jsx";

const root = document.getElementById("root");

// Mount app
createRoot(root).render((
    <ToastProvider>
        <ConfirmProvider>
            <Editor />
            <Confirm />
        </ConfirmProvider>
        <Toaster />
    </ToastProvider>
));
