import React from "react";
import {createApp} from "../app.js";

export const useApp = (callbacks) => {
    const app = React.useRef(null);

    if (!app.current) {
        app.current = createApp(callbacks);
    }

    return app.current;
};
