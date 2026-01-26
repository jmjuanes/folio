import React from "react";
import { Layout } from "../components/layout.tsx";
import { Loading } from "../components/loading.jsx";
import { ContextMenu } from "../components/context-menu.jsx";
import { ExportDialog } from "../components/dialogs/export.jsx";
import { PageEditDialog } from "../components/dialogs/page-edit.jsx";
import { KeyboardShortcutsDialog } from "../components/dialogs/keyboard-shortcuts.jsx";
import { MainMenu } from "../components/menus/main.tsx";
import { PagesMenu } from "../components/menus/pages.jsx";
import { SettingsMenu } from "../components/menus/settings.jsx";
import { EditionPanel } from "../components/panels/edition.jsx";
import { HistoryPanel } from "../components/panels/history.jsx";
import { ZoomPanel } from "../components/panels/zoom.jsx";
import { Minimap } from "../components/minimap.tsx";
import { Toolbar } from "../components/toolbar.tsx";
import { Layers } from "../components/layers.tsx";

// export type for the editor components
// export type EditorComponentsMap = Record<string, ((props?: any) => React.JSX.Element) | null> | null;
export type EditorComponentsMap = {
    [key: string]: ((props?: any) => React.JSX.Element) | null;
};

// @description editor components context
export const EditorComponentsContext = React.createContext<EditorComponentsMap>({});

// @description hook to access to editor components
export const useEditorComponents = (): EditorComponentsMap => {
    return React.useContext(EditorComponentsContext);
};

// type definitions for the editor components provider
export type EditorComponentsProviderProps = {
    components: Partial<EditorComponentsMap>,
    children: React.ReactNode,
};

// @description editor components provider
// @param {object} props React props
// @param {object} props.components Editor components
// @param {React.ReactNode} props.children React children
export const EditorComponentsProvider = (props: EditorComponentsProviderProps): React.JSX.Element => {
    const editorComponents = React.useMemo<EditorComponentsMap>(() => {
        return {
            // general components
            Loading: Loading,
            Layout: Layout,
            ContextMenu: ContextMenu,
            // dialogs components
            ExportDialog: ExportDialog,
            PageEditDialog: PageEditDialog,
            KeyboardShortcutsDialog: KeyboardShortcutsDialog,
            // menus
            MainMenu: MainMenu,
            PagesMenu: PagesMenu,
            SettingsMenu: SettingsMenu,
            // panels
            EditionPanel: EditionPanel,
            HistoryPanel: HistoryPanel,
            ZoomPanel: ZoomPanel,
            Minimap: Minimap,
            Toolbar: Toolbar,
            Layers: Layers,
            Title: null,
            Library: null,
            // canvas
            BehindTheCanvas: null,
            OverTheCanvas: null,
            // overrides
            ...props.components,
        };
    }, [ props.components ]);

    return (
        <EditorComponentsContext.Provider value={editorComponents}>
            {props.children}
        </EditorComponentsContext.Provider>
    );
};
