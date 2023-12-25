import React from "react";
import Rouct from "rouct";
import {createRoot} from "react-dom/client";
import {ClientProvider, useClient} from "./contexts/ClientContext.jsx";
import {ConfirmProvider} from "./contexts/ConfirmContext.jsx";

import Layout from "./layout.jsx";
import DashboardPage from "./pages/dashboard.jsx";
import BoardPage from "./pages/board.jsx";

import "lowcss/dist/low.css";

// Main app component
const App = props => {
    const client = useClient();
    const handleOpen = id => {
        return Rouct.redirect(`/board#${id}`);
    };
    const handleCreate = () => {
        const boardData = {
            title: "Untitled",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        client.addBoard(boardData)
            .then(response => handleOpen(response.id))
            .catch(error => console.error(error));
    };
    const layoutProps = {
        version: props.version,
        onCreate: handleCreate,
        onRedirect: Rouct.redirect,
    };
    return (
        <Rouct.Router pathPrefix={props.pathPrefix} routing={Rouct.BrowserRouting}>
            <Layout {...layoutProps}>
                <Rouct.Switch>
                    <Rouct.Route exact path="/board" render={request => (
                        <div className="fixed top-0 left-0 h-full w-full bg-white text-neutral-700">
                            <BoardPage
                                key={"board:" + request.hash}
                                id={(request.hash || "").replace(/^#/, "")}
                            />
                        </div>
                    )} />
                    <Rouct.Route exact path="/dashboard" render={() => (
                        <DashboardPage
                            onCreate={handleCreate}
                            onOpen={handleOpen}
                        />
                    )} />
                </Rouct.Switch>
            </Layout>
        </Rouct.Router>
    );
};

// Mount app component
createRoot(document.getElementById("root")).render((
    <ClientProvider>
        <ConfirmProvider>
            <App
                pathPrefix="/"
                version={process.env.VERSION}
            />
        </ConfirmProvider>
    </ClientProvider>
));
