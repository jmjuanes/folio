import React from "react";
import {createScene} from "@lib/scene.js";

export const useScene = (initialData) => {
    const scene = React.useRef(null);
    // const [, update] = React.useReducer(x => (x + 1) % 100, 0);

    if (!scene.current) {
        scene.current = createScene(initialData);
    }

    return scene.current;
};
