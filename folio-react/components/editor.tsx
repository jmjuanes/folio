import { EditorProvider, useEditor } from "../contexts/editor.tsx";
import {
    EditorComponentsProvider,
    useEditorComponents,
} from "../contexts/editor-components.tsx";
import { LibraryProvider } from "../contexts/library.tsx";
import { PreferencesProvider } from "../contexts/preferences.tsx";
import { ToolsProvider } from "../contexts/tools.tsx";
import { ActionsProvider } from "../contexts/actions.tsx";
import { WorkbenchProvider } from "../contexts/workbench.tsx";
import { Canvas } from "./canvas.tsx";

import type { JSX } from "react";
import type { ToolsOverrides } from "../contexts/tools.tsx";
import type { ActionsOverrides } from "../contexts/actions.tsx";
import type { Library } from "../lib/library.ts";
import type { PointerSession } from "../lib/pointer.ts";

// @private inner editor component
const InnerEditor = () => {
    const editor = useEditor();
    const {
        Layout,
        BehindTheCanvas,
        OverTheCanvas,
        Overlays,
        Pointer,
    } = useEditorComponents();

    return (
        <Layout>
            {!!BehindTheCanvas && (
                <BehindTheCanvas />
            )}
            <Canvas>
                <Overlays />
                {!!Pointer && editor.pointer.getSessions().map((pointerSession: PointerSession) => (
                    <Pointer
                        key={pointerSession.id}
                        points={pointerSession.points}
                        color={pointerSession.color}
                        size={pointerSession.size}
                        opacity={pointerSession.opacity}
                    />
                ))}
            </Canvas>
            {!!OverTheCanvas && (
                <OverTheCanvas />
            )}
        </Layout>
    );
};

export type EditorOverrides = {
    actions?: ActionsOverrides;
    tools?: ToolsOverrides;
};

export type EditorProps = {
    components?: any;
    data?: any;
    library?: any;
    preferences?: any;
    tools?: any[];
    overrides?: EditorOverrides | null,
    onChange?: (data: any) => void;
    onLibraryChange?: (library: Library) => void;
};

// @description Public editor
export const Editor = (props: EditorProps): JSX.Element => {
    return (
        <PreferencesProvider preferences={props.preferences}>
            <EditorComponentsProvider components={props.components}>
                <LibraryProvider data={props.library} onChange={props.onLibraryChange}>
                    <EditorProvider {...props}>
                        <ToolsProvider overrides={props.overrides?.tools}>
                            <WorkbenchProvider>
                                <ActionsProvider overrides={props.overrides?.actions}>
                                    <InnerEditor />
                                </ActionsProvider>
                            </WorkbenchProvider>
                        </ToolsProvider>
                    </EditorProvider>
                </LibraryProvider>
            </EditorComponentsProvider>
        </PreferencesProvider>
    );
};
