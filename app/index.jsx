import React from "react";
import {createRoot} from "react-dom/client";
import Rouct from "rouct";

import {ClientProvider} from "./contexts/ClientContext.jsx";
import {Board} from "./components/Board.jsx";
// import {Loading} from "./components/Loading.jsx";

const App = () => (
    <ClientProvider>
        <Rouct.Router routing={Rouct.HashbangRouting}>
            <Rouct.Route path="/:id" render={request => (
                <Board
                    key={request.id || "draft"}
                    id={request.id || ""}
                />
            )} />
        </Rouct.Router>
    </ClientProvider>
);

// Mount app
createRoot(document.getElementById("root")).render(<App />);
