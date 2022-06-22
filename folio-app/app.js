import React from "react";
import ReactDOM from "react-dom";
import kofi from "kofi";

import {FolioBoard} from "./index.js";
// import {createLocalClient} from "@folio/client/local.js";

const App = props => {
    return (
        <div className="is-fixed has-top-none has-left-none has-w-full has-h-full">
            <FolioBoard id={props.id} />
        </div>
    );
};

// Mount app
kofi.ready(() => {
    // const client = createLocalClient();
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(<App id="" />);

    // Create a new board
    // client.boards.create({name: "Test"}).then(id => {
    //     root.render(<App id={id} client={client} />);
    // });
});
