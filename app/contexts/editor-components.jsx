import React from "react";
import {Layout} from "../components/layout.jsx";
import {Loading} from "../components/loading.jsx";
import {ContextMenu} from "../components/context-menu.jsx";
import {ExportDialog} from "../components/dialogs/export.jsx";
import {LibraryAddDialog} from "../components/dialogs/library-add.jsx";
import {LibraryExportDialog} from "../components/dialogs/library-export.jsx";
import {PagesEditDialog} from "../components/dialogs/pages-edit.jsx";
import {LibraryMenu} from "../components/menus/library.jsx";
import {EditorMenu} from "../components/menus/editor.jsx";
import {PagesMenu} from "../components/menus/pages.jsx";
import {SettingsMenu} from "../components/menus/settings.jsx";
import {EditionPanel} from "../components/panels/edition.jsx";
import {HistoryPanel} from "../components/panels/history.jsx";
import {MinimapPanel} from "../components/panels/minimap.jsx";
import {ToolbarPanel} from "../components/panels/toolbar.jsx";
import {ZoomPanel} from "../components/panels/zoom.jsx";
import {Menu} from "../components/panels/menu.jsx";

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
            PagesEditDialog: PagesEditDialog,
            // menus
            LibraryMenu: LibraryMenu,
            EditorMenu: EditorMenu,
            PagesMenu: PagesMenu,
            SettingsMenu: SettingsMenu,
            // panels
            Menu: Menu,
            EditionPanel: EditionPanel,
            HistoryPanel: HistoryPanel,
            MinimapPanel: MinimapPanel,
            Toolbar: ToolbarPanel,
            ZoomPanel: ZoomPanel,
            ...components,
        };
    }, [components]);

    return (
        <EditorComponentsContext.Provider value={editorComponents}>
            {children}
        </EditorComponentsContext.Provider>
    );
};
