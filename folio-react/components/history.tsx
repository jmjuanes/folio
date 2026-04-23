import { ACTIONS } from "../constants.js";
import { useEditor } from "../contexts/editor.tsx";
import { useActions } from "../contexts/actions.tsx";
import { Island } from "./ui/island.tsx";
import { JSX } from "react";

// history component
export const History = (): JSX.Element => {
    const editor = useEditor();
    const { dispatchAction } = useActions();
    return (
        <Island>
            <Island.Button
                icon="history-undo"
                disabled={editor.page.readonly || !editor.canUndo()}
                onClick={() => {
                    dispatchAction(ACTIONS.UNDO);
                }}
            />
            <Island.Button
                icon="history-redo"
                disabled={editor.page.readonly || !editor.canRedo()}
                onClick={() => {
                    dispatchAction(ACTIONS.REDO);
                }}
            />
        </Island>
    );
};
