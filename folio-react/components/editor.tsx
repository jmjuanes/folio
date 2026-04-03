import React from "react";
import { EditorProvider } from "../contexts/editor.tsx";
import { ContextMenuProvider } from "../contexts/context-menu.tsx";
import { SurfaceProvider } from "../contexts/surface.tsx";
import {
    EditorComponentsProvider,
    useEditorComponents,
} from "../contexts/editor-components.tsx";
import { ConfirmProvider } from "../contexts/confirm.jsx";
import { DialogsProvider } from "../contexts/dialogs.tsx";
import { LibraryProvider } from "../contexts/library.tsx";
import { PreferencesProvider } from "../contexts/preferences.tsx";
import { ToolsProvider } from "../contexts/tools.tsx";
import { ActionsProvider } from "../contexts/actions.tsx";
import { Canvas } from "./canvas.tsx";

import type { ToolsOverrides } from "../contexts/tools.tsx";
import type { ActionsOverrides } from "../contexts/actions.tsx";
import type { Library } from "../lib/library.ts";

// @private inner editor component
const InnerEditor = () => {
    const {
        Layout,
        BehindTheCanvas,
        OverTheCanvas,
        Overlays,
    } = useEditorComponents();

    return (
        <Layout>
            {!!BehindTheCanvas && (
                <BehindTheCanvas />
            )}
            <Canvas>
                <Overlays />
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
export const Editor: React.FC<EditorProps> = props => {
    return (
        <PreferencesProvider preferences={props.preferences}>
            <EditorComponentsProvider components={props.components}>
                <LibraryProvider data={props.library} onChange={props.onLibraryChange}>
                    <EditorProvider {...props}>
                        <ToolsProvider overrides={props.overrides?.tools}>
                            <ConfirmProvider>
                                <DialogsProvider>
                                    <SurfaceProvider render={(surfaceContent) => (
                                        <ActionsProvider overrides={props.overrides?.actions}>
                                            <ContextMenuProvider>
                                                <InnerEditor />
                                                {surfaceContent}
                                            </ContextMenuProvider>
                                        </ActionsProvider>
                                    )} />
                                </DialogsProvider>
                            </ConfirmProvider>
                        </ToolsProvider>
                    </EditorProvider>
                </LibraryProvider>
            </EditorComponentsProvider>
        </PreferencesProvider>
    );
};
