import { Fragment } from "react";
import { TOOLS } from "../constants.js";
import { useEditor } from "../contexts/editor.tsx";
import { useEditorComponents } from "../contexts/editor-components.tsx";
import type { JSX } from "react";
import type { ToolState } from "../lib/tool.ts";
import type { PointerSession } from "../lib/pointer.ts";

export const Overlays = (): JSX.Element => {
    const editor = useEditor();
    const tool = editor.getCurrentTool() as ToolState | null;
    const {
        Bounds,
        Brush,
        Dimensions,
        Handlers,
        Snaps,
        Pointer,
    } = useEditorComponents();

    return (
        <Fragment>
            {!!Bounds && tool?.id === TOOLS.SELECT && (
                <Bounds />
            )}
            {!!Handlers && tool?.id === TOOLS.SELECT && (
                <Handlers />
            )}
            {!!Brush && tool?.id === TOOLS.SELECT && tool?.activeStateId === "brushing" && (
                <Brush />
            )}
            {!!Snaps && tool?.id === TOOLS.SELECT && (
                <Snaps />
            )}
            {!!Dimensions && editor?.appState?.objectDimensions && (
                <Dimensions />
            )}
            {!!Pointer && editor.pointer.getSessions().map((pointerSession: PointerSession) => (
                <Pointer
                    key={pointerSession.id}
                    points={pointerSession.points}
                    color={pointerSession.color}
                    size={pointerSession.size}
                    opacity={pointerSession.opacity}
                />
            ))}
        </Fragment>
    );
};
