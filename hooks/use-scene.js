import React from "react";
import {ZOOM_DEFAULT} from "@lib/constants.js";
import {createScene} from "@lib/scene.js";

export const useScene = (initialData, update) => {
    const scene = React.useRef(null);
    // const [, update] = React.useReducer(x => (x + 1) % 100, 0);

    if (!scene.current) {
        scene.current = createScene(initialData, update);
    }

    return scene.current;
};
