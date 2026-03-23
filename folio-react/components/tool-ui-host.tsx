import React from "react";
import { useEditor } from "../contexts/editor.jsx";

import { ToolUIRegistry } from "../tools/ui-registry.tsx";

export const ToolUIHost: React.FC = () => {
    const editor = useEditor();
    const activeTool = editor.activeTool;

    if (!activeTool) return null;

    const Toolbar = ToolUIRegistry[activeTool.id]?.Toolbar;

    return (
        <div className="tool-ui-host">
            {Toolbar && <Toolbar tool={activeTool} />}
            {editor.ui}
        </div>
    );
};
