import React from "react";
import { createRoot } from "react-dom/client";
import { Demo } from "./components/demo.jsx";
import { createLocalStore } from "./store/local.js";

// 1. create a new instance of the local store
const store = createLocalStore();

// 2. render the folio demo
createRoot(document.getElementById("root")).render((
    <div className="fixed top-0 left-0 h-full w-full bg-white text-base flex">
        <Demo store={store} />
    </div>
));
