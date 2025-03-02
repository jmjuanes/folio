import React from "react";
import {createRoot} from "react-dom/client";
import {Editor} from "./components/editor.jsx";
import {createLocalStore} from "./store/local.js";

const App = () => {
    const store = React.useMemo(() => {
        return createLocalStore();
    }, []);

    return (
        <div className="fixed top-0 left-0 h-full w-full bg-white text-base flex">
            <Editor store={store} />
        </div>
    );
};

createRoot(document.getElementById("root")).render((
    <App />
));
