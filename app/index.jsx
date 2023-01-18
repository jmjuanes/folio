import React from "react";
import {createRoot} from "react-dom/client";

import {ClientProvider, useClient} from "./contexts/ClientContext.jsx";
import {Board} from "./components/Board.jsx";
// import {Loading} from "./components/Loading.jsx";

const App = props => {
    const client = useClient();
    const [currentProject, setCurrentProject] = React.useState(null);

    // When the app is mounted, we will load the current project from database
    // and set it to the currentProject state
    React.useEffect(() => client.initialize().then(id => setCurrentProject(id)), []);

    return (
        <React.Fragment>
            {!!currentProject && (
                <Board
                    key={currentProject}
                    project={currentProject}
                />
            )}
        </React.Fragment>
    );
};

const root = createRoot(document.getElementById("root"));
root.render(
    <ClientProvider>
        <App />
    </ClientProvider>
);
