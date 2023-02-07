import React from "react";
import {createRoot} from "react-dom/client";
import Rouct from "rouct";

import {ClientProvider} from "./contexts/ClientContext.jsx";
import {ToastProvider} from "./contexts/ToastContext.jsx";

import {Editor} from "./components/Editor.jsx";
import {Welcome} from "./components/Welcome.jsx";
import {Projects} from "./components/Projects.jsx";
import {Toaster} from "./components/commons/Toaster.jsx";

const App = () => (
    <Rouct.Router routing={Rouct.MemoryRouting}>
        <ToastProvider>
            <ClientProvider render={() => (
                <Rouct.Route path="*" render={request => {
                    const id = request?.query?.id || "";
                    const isWelcomeVisible = !id;
                    const isProjectsVisible = !!request?.query?.projects;

                    return (
                        <React.Fragment>
                            <Editor
                                key={id}
                                id={id}
                                onLoad={newId => {
                                    Rouct.redirect(`/?id=${newId}`);
                                }}
                                onShowProjects={() => {
                                    console.log("SHOW_PROJECTS");
                                    Rouct.redirect(`/?id=${id}&projects=true`)
                                }}
                            />
                            {isWelcomeVisible && (
                                <Welcome />
                            )}
                            {isProjectsVisible && (
                                <Projects
                                    currentProject={id}
                                    onClose={() => {
                                        Rouct.redirect(`/?id=${id}`);
                                    }}
                                    onLoad={newId => {
                                        Rouct.redirect(`/?id=${newId}`);
                                    }}
                                />
                            )}
                        </React.Fragment>
                    );
                }} />
            )} />
            <Toaster />
        </ToastProvider>
    </Rouct.Router>
);

// Mount app
createRoot(document.getElementById("root")).render(<App />);
