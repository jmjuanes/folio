import React from "react";
import kofi from "kofi";

import {useBoard} from "./hooks/useBoard.js";
import {useNotifications} from "./hooks/useNotifications.js";

// import {Menubar} from "./Menubar.js";
import {Toasts} from "./components/Toasts.js";
import {Stylebar} from "./components/Stylebar.js";
import {Toolbar} from "./components/Toolbar.js";
import {Historybar} from "./components/Historybar.js";

import {blobToClipboard} from "./utils/blobUtils.js";

export const GitDrawBoard = props => {
    const parentRef = React.useRef(null);
    const boardRef = useBoard(parentRef, {});

    const [updateKey, forceUpdate] = React.useReducer(x => x + 1, 0);
    const [ready, setReady] = React.useState(false);
    const notifications = useNotifications();

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

        setReady(true);
        return () => {
            boardRef.current.destroy();
        };
    }, []);

    return (
        <div className="is-relative has-w-full has-h-full" ref={parentRef}>
            {kofi.when(ready, () => (
                <React.Fragment>
                    <Toolbar
                        currentType={boardRef.current.getType()}
                        onTypeChange={type => {
                            boardRef.current.setType(type);
                            forceUpdate();
                        }}
                    />
                    <Stylebar
                        key={updateKey}
                        selection={boardRef.current.getSelection()}
                        selectionLocked={boardRef.current.isSelectionLocked()}
                        activeGroup={boardRef.current.getActiveGroup()}
                        onChange={(n, v) => {
                            boardRef.current.updateSelection(n, v);
                        }}
                        onRemoveClick={() => {
                            boardRef.current.removeSelection();
                            forceUpdate();
                        }}
                        onBringForwardClick={() => {
                            boardRef.current.bringSelectionForward();
                        }}
                        onSendBackwardClick={() => {
                            boardRef.current.sendSelectionBackward();
                        }}
                        onGroupSelectionClick={() => {
                            boardRef.current.groupSelection();
                            forceUpdate();
                        }}
                        onUngroupSelectionClick={() => {
                            boardRef.current.ungroupSelection();
                            forceUpdate();
                        }}
                    />
                    <Historybar
                        undoDisabled={boardRef.current.isUndoDisabled()}
                        redoDisabled={boardRef.current.isRedoDisabled()}
                        onUndoClick={() => {
                            boardRef.current.undo();
                            forceUpdate();
                        }}
                        onRedoClick={() => {
                            boardRef.current.redo();
                            forceUpdate();
                        }}
                    />
                </React.Fragment>
            ))}
            <Toasts
                items={notifications.getAll()}
                onDelete={id => notifications.remove(id)}
            />
        </div>
    );
};

GitDrawBoard.defaultProps = {
    client: null,
    id: "",
};
