import React from "react";
import {createRoot} from "react-dom/client";
import Rouct from "rouct";

import {ClientProvider} from "./contexts/ClientContext.jsx";
import {Editor} from "./components/Editor.jsx";
import {Welcome} from "./components/Welcome.jsx";

const App = () => (
    <Rouct.Router routing={Rouct.MemoryRouting}>
        <ClientProvider render={() => (
            <Rouct.Route path="*" render={(query) => (
                <React.Fragment>
                    <Editor
                        key={query?.id || ""}
                        id={query?.id || ""}
                    />
                    {(query?.welcome || !query?.id) && (
                        <Welcome />
                    )}
                </React.Fragment>
            )} />
        )} />
    </Rouct.Router>
);

// Mount app
createRoot(document.getElementById("root")).render(<App />);
