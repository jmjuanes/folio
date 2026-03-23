import React from "react";
import { useEditor } from "../../contexts/editor.jsx";
import { Handlers } from "../children/handlers.tsx";
import { SnapEdges } from "../children/snaps.tsx";
import { Dimensions } from "../children/dimensions.tsx";
import { Bounds } from "../children/bounds.tsx";
import { Brush } from "../children/brush.tsx";

export const SelectCanvasOverlay: React.FC = () => {
    const editor = useEditor();
    const selection = editor.state.selection;

    return (
        <React.Fragment>
            <Bounds />
            <Handlers />
            {selection && <Brush {...selection} />}
            {editor.appState.snapToElements && (
                <SnapEdges edges={editor.state.snapEdges || []} />
            )}
            {editor.appState.objectDimensions && <Dimensions />}
        </React.Fragment>
    );
};
