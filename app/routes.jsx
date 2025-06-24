import React from "react";
import {useHash} from "./hooks/use-hash.js";
import {Welcome} from "./components/welcome.jsx";
import {Board} from "./components/board.jsx";

export const Routes = () => {
    const [hash] = useHash();
    // 1. current hash is empty, in this case user has not selected
    // a board, so we render the welcome component
    if (hash === "" || hash === "#") {
        return <Welcome />;
    }
    // 2. current hash is not empty, so in this case we will render the
    // board component and pass to it the id to check if the board exists
    return (
        <Board key={hash} id={hash} />
    );
};
