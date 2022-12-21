import React from "react";
import {createRoot} from "react-dom/client";
import Folio from "folio-board";

const root = createRoot(document.getElementById("root"));
root.render(
    <div className="bg:white text:base text:dark-700 position:fixed top:0 left:0 h:full w:full">
        <Folio.Board />
    </div>
);
