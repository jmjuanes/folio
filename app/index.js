import React from "react";
import {createRoot} from "react-dom/client";
import {Folio} from "folio-react";
import {blobToClipboard} from "folio-react/utils/blob.js";
import {css} from "folio-react/styles.js";

// import {useNotifications} from "./hooks/useNotifications.js";
// import {HomePage} from "./pages/Home.js";

const rootClass = css({
    height: "100%",
    left: "0px",
    position: "fixed",
    top: "0px",
    width: "100%",
});

const App = props => {
    // const ref = React.useRef(null);
    // const notifications = useNotifications();
    return (
        <div className={rootClass}>
            <Folio
                ref={ref}
                onScreenshot={blob => {
                    blobToClipboard(blob);
                    // notifications.success("Screenshot copied to clipboard");
                }}
            />
        </div>
    );
};

// Mount app
const root = createRoot(document.getElementById("root"));
root.render(<App id="" />);
