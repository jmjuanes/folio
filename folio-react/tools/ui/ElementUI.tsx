import React from "react";
import { useEditor } from "../../contexts/editor.jsx";
import { PickPanel } from "../children/pick-panel.tsx";
import { Dimensions } from "../children/dimensions.tsx";

export const ElementToolbar: React.FC<{ tool?: any }> = ({ tool }) => {
    const editor = useEditor();
    
    if (!tool?.elementPicks) {
        return null;
    }

    return (
        <PickPanel
            values={editor.defaults}
            items={tool.elementPicks}
            onChange={(field: string, value: any) => {
                editor.defaults[field] = value;
                if (typeof tool.onPickChange === "function") {
                    tool.onPickChange(editor.defaults, field, value);
                }
                editor.update();
            }}
        />
    );
};

export const ElementCanvasOverlay: React.FC = () => {
    const editor = useEditor();
    
    return (
        <React.Fragment>
            {editor.appState.objectDimensions && (
                <Dimensions />
            )}
        </React.Fragment>
    );
};
