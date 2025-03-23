import React from "react";
import {createRoot} from "react-dom/client";
import {Editor} from "folio-react/components/editor.jsx";
import {Welcome} from "./components/welcome.jsx";
import {createLocalStore} from "./store/local.js";

const App = () => {
    const store = React.useMemo(() => {
        return createLocalStore();
    }, []);
    
    return (
        <Editor
            store={store}
            components={{
                OverTheCanvas: Welcome,
            }}
        />
    );
};

createRoot(document.getElementById("root")).render((
    <div className="fixed top-0 left-0 h-full w-full bg-white text-base flex">
        <App />
    </div>
));
