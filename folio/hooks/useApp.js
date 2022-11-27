import React from "react";
import {createApp} from "../app.js";

export const useApp = () => {
    const app = React.useRef(null);

    if (!app.current) {
        app.current = createApp();
    }

    return app;
};
