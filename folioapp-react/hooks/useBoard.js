import React from "react";
import {createBoard} from "@folioapp/lib";

// Use board hook
export const useBoard = (parent, options) => {
    const ref = React.useRef(null);

    // Register effect listener --> initialize board
    React.useEffect(() => {
        ref.current = createBoard(parent.current, options || {});
        return () => ref.current.destroy();
    }, []);

    // Return the board reference
    return ref;
};
