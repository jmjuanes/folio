import React from "react";
import kofi from "kofi";

import {useBoard} from "./hooks/useBoard.js";
import {useNotifications} from "./hooks/useNotifications.js";

// import {Menubar} from "./components/Menubar.js";
import {Stylebar} from "./components/Stylebar.js";
import {Toolbar} from "./components/Toolbar.js";
import {Toasts} from "./components/Toasts.js";

import {blobToClipboard} from "./utils/blobUtils.js";

export const GitDrawBoard = props => {
    const parentRef = React.useRef(null);
    const boardRef = useBoard(parentRef, props.options);
    const notifications = useNotifications();

    const [ready, setReady] = React.useState(false);
    const [updateKey, forceUpdate] = React.useReducer(x => x + 1, 0);

    React.useEffect(() => {
        // Register event listeners to the board
        boardRef.current.on("update", () => forceUpdate());
        boardRef.current.on("screenshot", region => {
            kofi.delay(500, () => {
                boardRef.current.screenshot(region).then(blob => {
                    blobToClipboard(blob);
                    notifications.success("Screenshot copied to clipboard");
                });
            });
        });

        // Board ready --> Display board bars
        setReady(true);
    }, []);

    return (
        <div className="has-w-full has-h-full is-relative">
            <div ref={parentRef} className="has-w-full has-h-full" />
            {kofi.when(ready, () => (
                <React.Fragment>
                    {/* <Menubar /> */}
                    <Toolbar
                        currentElement={boardRef.current.getCurrentTool()}
                        onElementClick={tool => {
                            boardRef.current.setCurrentTool(tool);
                            forceUpdate();
                        }}
                    />
                    <Stylebar
                        key={updateKey}
                        selection={boardRef.current.getSelection()}
                        selectionLocked={boardRef.current.isSelectionLocked()}
                        onChange={(n, v) => {
                            boardRef.current.updateSelection(n, v);
                        }}
                        onRemove={() => {
                            boardRef.current.removeSelection();
                            forceUpdate();
                        }}
                    />
                    <Toasts
                        items={notifications.getAll()}
                        onDelete={id => notifications.remove(id)}
                    />
                </React.Fragment>
            ))}
        </div>
    );
};

GitDrawBoard.defaultProps = {
    options: {},
};
