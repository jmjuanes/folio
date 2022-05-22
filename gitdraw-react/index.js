import React from "react";
import kofi from "kofi";
import {createBoard} from "@gitdraw/board";

import {Menubar} from "./components/menubar.js";
import {Stylebar} from "./components/stylebar.js";
import {Toolbar} from "./components/toolbar.js";

export const GitDrawBoard = React.forwardRef((props, ref) => {
    const parentRef = React.useRef(null);
    const [ready, setReady] = React.useState(false);
    const [updateKey, forceUpdate] = React.useReducer(x => x + 1, 0);

    React.useEffect(() => {
        ref.current = createBoard(parentRef.current, props.options || {});
        ref.current.on("selection:change", () => forceUpdate());

        setReady(true);

        return () => ref.current.destroy();
    }, []);

    return (
        <div className="has-w-full has-h-full is-relative">
            <div className="has-w-full has-h-full">
                <canvas ref={parentRef} width="100px" height="100px" />
            </div>
            {kofi.when(ready, () => (
                <React.Fragment>
                    <Menubar />
                    <Toolbar
                        onElementClick={type => {
                            ref.current.setCurrentType(type);
                            forceUpdate();
                        }}
                    />
                    <Stylebar
                        key={updateKey}
                        selection={ref.current.selection || []}
                        selectionLocked={!!ref.current.selectionLocked}
                        onChange={(n, v) => ref.current.updateSelection(n, v)}
                        onRemove={() => {
                            ref.current.removeSelection();
                            forceUpdate();
                        }}
                    />
                </React.Fragment>
            ))}
        </div>
    );
});

GitDrawBoard.defaultProps = {
    options: {},
};
