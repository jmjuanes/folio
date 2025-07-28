import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/app.tsx";
import { createLocalStore } from "./store/local.ts";
import type { Store } from "./types/store.ts";

// 1. create a new instance of the local store
const store = createLocalStore() as Store;

// 2. render the folio demo
createRoot(document.getElementById("root")).render((
    <div className="fixed top-0 left-0 h-full w-full bg-white text-base flex">
        <App store={store} />
    </div>
));
