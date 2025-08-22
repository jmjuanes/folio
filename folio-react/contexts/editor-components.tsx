import React from "react";
import { Layout } from "../components/layout.jsx";
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
import { MinimapPanel } from "../components/panels/minimap.jsx";
import { ToolbarPanel } from "../components/panels/toolbar.jsx";
import { ZoomPanel } from "../components/panels/zoom.jsx";
import { LayersPanel } from "../components/panels/layers.jsx";
import { MenuPanel } from "../components/panels/menu.jsx";

// export type for the editor components
export type EditorComponentsMap = Record<string, React.Node | null>;

// @description editor components context
export const EditorComponentsContext = React.createContext<EditorComponentsMap>(null);

// @description hook to access to editor components
export const useEditorComponents = (): EditorComponentsMap => {
    return React.useContext(EditorComponentsContext);
};

// type definitions for the editor components provider
export type EditorComponentsProviderProps = {
    components: Partial<EditorComponentsMap>,
    children: React.Node,
};

// @description editor components provider
// @param {object} props React props
// @param {object} props.components Editor components
// @param {React.ReactNode} props.children React children
export const EditorComponentsProvider = (props: EditorComponentsProviderProps): React.JSX.Element => {
    const editorComponents = React.useMemo(() => {
        return {
            // general components
            Loading: Loading,
            Layout: Layout,
            ContextMenu: ContextMenu,
            // dialogs components
            ExportDialog: ExportDialog,
            LibraryAddDialog: null,
            LibraryExportDialog: null,
            PageEditDialog: PageEditDialog,
            KeyboardShortcutsDialog: KeyboardShortcutsDialog,
            // menus
            LibraryMenu: null,
            MainMenu: MainMenu,
            PagesMenu: PagesMenu,
            SettingsMenu: SettingsMenu,
            // panels
            MenuPanel: MenuPanel,
            EditionPanel: EditionPanel,
            HistoryPanel: HistoryPanel,
            MinimapPanel: MinimapPanel,
            ZoomPanel: ZoomPanel,
            Toolbar: ToolbarPanel,
            Layers: LayersPanel,
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
