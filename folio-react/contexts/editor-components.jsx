import React from "react";
import {Layout} from "../components/layout.jsx";
import {Loading} from "../components/loading.jsx";
import {ContextMenu} from "../components/context-menu.jsx";
import {ExportDialog} from "../components/dialogs/export.jsx";
import {LibraryAddDialog} from "../components/dialogs/library-add.jsx";
import {LibraryExportDialog} from "../components/dialogs/library-export.jsx";
import {PageEditDialog} from "../components/dialogs/page-edit.jsx";
import {PreferencesDialog} from "../components/dialogs/preferences.jsx";
import {KeyboardShortcutsDialog} from "../components/dialogs/keyboard-shortcuts.jsx";
import {LibraryMenu} from "../components/menus/library.jsx";
import {MainMenu} from "../components/menus/main.jsx";
import {PagesMenu} from "../components/menus/pages.jsx";
import {SettingsMenu} from "../components/menus/settings.jsx";
import {EditionPanel} from "../components/panels/edition.jsx";
import {HistoryPanel} from "../components/panels/history.jsx";
import {MinimapPanel} from "../components/panels/minimap.jsx";
import {ToolbarPanel} from "../components/panels/toolbar.jsx";
import {ZoomPanel} from "../components/panels/zoom.jsx";
import {LayersPanel} from "../components/panels/layers.jsx";
import {MenuPanel} from "../components/panels/menu.jsx";

// @description editor components context
export const EditorComponentsContext = React.createContext(null);

// @description hook to access to editor components
export const useEditorComponents = () => {
    return React.useContext(EditorComponentsContext);
};

// @description editor components provider
// @param {object} props React props
// @param {object} props.components Editor components
// @param {React.ReactNode} props.children React children
export const EditorComponentsProvider = ({components = {}, children}) => {
    const editorComponents = React.useMemo(() => {
        return {
            // general components
            Loading: Loading,
            Layout: Layout,
            ContextMenu: ContextMenu,
            // dialogs components
            ExportDialog: ExportDialog,
            LibraryAddDialog: LibraryAddDialog,
            LibraryExportDialog: LibraryExportDialog,
            PageEditDialog: PageEditDialog,
            PreferencesDialog: PreferencesDialog,
            KeyboardShortcutsDialog: KeyboardShortcutsDialog,
            // menus
            LibraryMenu: LibraryMenu,
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
            ...components,
        };
    }, [components]);

    return (
        <EditorComponentsContext.Provider value={editorComponents}>
            {children}
        </EditorComponentsContext.Provider>
    );
};
