import React from "react";
import {createRoot} from "react-dom/client";
import {Folio} from "folio-react";
import {blobToClipboard} from "folio-react/utils/blob.js";

import {Toasts} from "./components/Toasts.js";
import {useNotifications} from "./hooks/useNotifications.js";

const App = props => {
    const ref = React.useRef(null);
    const notifications = useNotifications();
    return (
        <div className="is-fixed has-top-none has-left-none has-w-full has-h-full">
            <Folio
                ref={ref}
                onScreenshot={blob => {
                    blobToClipboard(blob);
                    notifications.success("Screenshot copied to clipboard");
                }}
            />
            <Toasts
                items={notifications.getAll()}
                onDelete={id => notifications.remove(id)}
            />
        </div>
    );
};

// Mount app
const root = createRoot(document.getElementById("root"));
root.render(<App id="" />);
