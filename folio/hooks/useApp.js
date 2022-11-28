import React from "react";
import {createApp} from "../app.js";

export const useApp = (width, height, callbacks) => {
    const app = React.useRef(null);

    if (!app.current) {
        app.current = createApp(width, height, callbacks);
    }

    return app.current;
};
