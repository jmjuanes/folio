import React from "react";
import {createRoot} from "react-dom/client";
import {Editor} from "folio-react/components/editor.jsx";
import {Welcome} from "./components/welcome.jsx";
import {createLocalStore} from "./store/local.js";

// 1. create a new instance of the local store
const store = createLocalStore();

// 2. components overrides
const componentsOverrides = {
    OverTheCanvas: Welcome,
};

// 3. render the folio app
createRoot(document.getElementById("root")).render((
    <div className="fixed top-0 left-0 h-full w-full bg-white text-base flex">
        <Editor
            store={store}
            components={componentsOverrides}
        />
    </div>
));
