import React from "react";
import {createRoot} from "react-dom/client";

import {Folio} from "folio-react";

const App = props => {
    return (
        <div className="is-fixed has-top-none has-left-none has-w-full has-h-full">
            <Folio />
        </div>
    );
};

// Mount app
const root = createRoot(document.getElementById("root"));
root.render(<App id="" />);
