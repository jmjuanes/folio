import React from "react";
import {createRoot} from "react-dom/client";
import Rouct from "rouct";

import {ClientProvider} from "./contexts/ClientContext.jsx";
import {Editor} from "./components/Editor.jsx";
// import {Loading} from "./components/Loading.jsx";

const App = () => (
    <ClientProvider render={() => (
        <Rouct.Router routing={Rouct.MemoryRouting}>
            <Rouct.Route path="/:id" render={request => (
                <Editor
                    key={request.id || "draft"}
                    id={request.id || ""}
                />
            )} />
        </Rouct.Router>
    )} />
);

// Mount app
createRoot(document.getElementById("root")).render(<App />);
