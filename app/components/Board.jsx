import React from "react";
import {Board as FolioBoard} from "folio-board";

export const Board = props => {
    return (
        <div className="bg:white text:base text:dark-700 position:fixed top:0 left:0 h:full w:full">
            <FolioBoard />
        </div>
    );
};
