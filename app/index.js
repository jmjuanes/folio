import React from "react";
import ReactDOM from "react-dom";

import {GitDrawBoard} from "@gitdraw/react";

const App = () => {
    return (
        <div className="has-w-full has-h-full">
            <GitDrawBoard />
        </div>
    );
};

// Mount app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
