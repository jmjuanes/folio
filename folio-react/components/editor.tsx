import React from "react";
import { EditorProvider } from "../contexts/editor.jsx";
import { ContextMenuProvider } from "../contexts/context-menu.jsx";
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
import { Canvas } from "./canvas.tsx";

// @private inner editor component
const InnerEditor = () => {
    const {
        Layout,
        BehindTheCanvas,
        OverTheCanvas,
    } = useEditorComponents();

    return (
        <Layout>
            {!!BehindTheCanvas && (
                <BehindTheCanvas />
            )}
            <Canvas />
            {!!OverTheCanvas && (
                <OverTheCanvas />
            )}
        </Layout>
    );
};

export type EditorProps = {
    components?: any;
    data?: any;
    library?: any;
    preferences?: any;
    tools?: any[];
    onChange?: (data: any) => void;
    onLibraryChange?: (library: any) => void;
};

// @description Public editor
export const Editor: React.FC<EditorProps> = props => {
    return (
        <PreferencesProvider preferences={props.preferences}>
            <EditorComponentsProvider components={props.components}>
                <LibraryProvider data={props.library} onChange={props.onLibraryChange}>
                    <EditorProvider {...props}>
                        <ToolsProvider tools={props.tools}>
                            <ConfirmProvider>
                                <DialogsProvider>
                                    <SurfaceProvider>
                                        <ContextMenuProvider>
                                            <InnerEditor />
                                        </ContextMenuProvider>
                                    </SurfaceProvider>
                                </DialogsProvider>
                            </ConfirmProvider>
                        </ToolsProvider>
                    </EditorProvider>
                </LibraryProvider>
            </EditorComponentsProvider>
        </PreferencesProvider>
    );
};
