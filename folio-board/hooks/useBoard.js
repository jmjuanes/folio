import React from "react";
import {createBoard} from "../board/index.js";

export const useBoard = initialElements => {
    const board = React.useRef(null);

    if (!board.current) {
        board.current = createBoard(initialElements);
    }

    return board;
};
