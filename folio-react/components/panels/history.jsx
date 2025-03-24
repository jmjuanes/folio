import React from "react";
import {ACTIONS} from "../../constants.js";
import {useEditor} from "../../contexts/editor.jsx";
import {useActions} from "../../hooks/use-actions.js";
import {Island} from "../ui/island.jsx";

// History panel component
export const HistoryPanel = () => {
    const editor = useEditor();
    const dispatchAction = useActions();
    return (
        <Island>
            <Island.Button
                icon="history-undo"
                roundedEnd={false}
                disabled={editor.page.readonly || !editor.canUndo()}
                onClick={() => {
                    dispatchAction(ACTIONS.UNDO);
                }}
            />
            <Island.Button
                icon="history-redo"
                roundedStart={false}
                disabled={editor.page.readonly || !editor.canRedo()}
                onClick={() => {
                    dispatchAction(ACTIONS.REDO);
                }}
            />
        </Island>
    );
};
