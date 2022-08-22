import React from "react";
import {createRoot} from "react-dom/client";
import {Folio} from "folio-react";
import {css} from "folio-react/styles.js";

const rootClass = css({
    apply: "mixins.root",
    fontFamily: "body",
    height: "100%",
    left: "0px",
    position: "fixed",
    top: "0px",
    width: "100%",
});

const App = props => {
    return (
        <div className={rootClass}>
            <Folio
                showWelcome={true}
                onScreenshot={null}
                onLoad={null}
            />
        </div>
    );
};

// Mount app
const root = createRoot(document.getElementById("root"));
root.render(<App id="" />);
