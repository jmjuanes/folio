import React from "react";
import {useEditor} from "../../contexts/editor.jsx";
import {Island} from "../island.jsx";

// History panel component
export const HistoryPanel = () => {
    const editor = useEditor();
    return (
        <Island>
            <Island.Button
                icon="history-undo"
                roundedEnd={false}
                disabled={editor.page.readonly || !editor.canUndo()}
                onClick={() => {
                    editor.undo();
                    editor.dispatchChange();
                    editor.update();
                }}
            />
            <Island.Button
                icon="history-redo"
                roundedStart={false}
                disabled={editor.page.readonly || !editor.canRedo()}
                onClick={() => {
                    editor.redo();
                    editor.dispatchChange();
                    editor.update();
                }}
            />
        </Island>
    );
};
