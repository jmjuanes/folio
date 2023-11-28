import React from "react";
import Rouct from "rouct";
import {createRoot} from "react-dom/client";
import {RouterProvider} from "./contexts/RouterContext.jsx";
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
        return Rouct.redirect(`/board#id=${id}`);
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
    return (
        <Rouct.Router pathPrefix={props.pathPrefix} routing={Rouct.BrowserRouting}>
            <Rouct.Switch>
                <Rouct.Route exact path="/board" render={request => (
                    <BoardPage
                        key={"board:" + request.query.id}
                        id={request.query.id}
                    />
                )} />
                <Rouct.Route exact path="*" render={() => (
                    <Layout onCreate={handleCreate}>
                        <Rouct.Switch>
                            <Rouct.Route exact path="/dashboard" render={() => (
                                <DashboardPage
                                    onCreate={handleCreate}
                                    onOpen={handleOpen}
                                />
                            )} />
                        </Rouct.Switch>
                    </Layout>
                )} />
            </Rouct.Switch>
        </Rouct.Router>
    );
};

// Mount app component
createRoot(document.getElementById("root")).render((
    <RouterProvider>
        <ClientProvider>
            <ConfirmProvider>
                <App pathPrefix="/" />
            </ConfirmProvider>
        </ClientProvider>
    </RouterProvider>
));
