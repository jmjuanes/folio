import React from "react";
import {createRoot} from "react-dom/client";
import {useDebounce} from "react-use";
// import {ClientProvider, useClient} from "./contexts/client.jsx";
import {Editor} from "./components/editor.jsx";

const App = () => {
    // const client = useClient();
    const [state, setState] = React.useState({});

    // Hook to save changes into storage
    // useDebounce(() => {
    //     if (state?.updatedAt) {
    //         client.data.set(state).then(() => {
    //             // TODO: display confirmation message
    //         });
    //     }
    // }, 250, [state?.updatedAt]);

    return (
        <div className="fixed top-0 left-0 h-full w-full bg-white text-base flex">
            <Editor />
        </div>
    );
};

createRoot(document.getElementById("root")).render((
    <App />
));
