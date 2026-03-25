import React from "react";
import { Layout } from "../components/layout.tsx";
import { Loading } from "../components/loading.jsx";
import { ContextMenu } from "../components/context-menu.jsx";
import { ExportDialog } from "../components/dialogs/export.jsx";
import { KeyboardShortcutsDialog } from "../components/dialogs/keyboard-shortcuts.jsx";
import { MainMenu } from "../components/menus/main.tsx";
import { PagesMenu } from "../components/menus/pages.tsx";
import { SettingsMenu } from "../components/menus/settings.jsx";
import { Commands } from "../components/commands.tsx";
import { EditionPanel } from "../components/panels/edition.jsx";
import { HistoryPanel } from "../components/panels/history.jsx";
import { ZoomPanel } from "../components/panels/zoom.jsx";
import { Minimap } from "../components/minimap.tsx";
import { Toolbar } from "../components/toolbar.tsx";
import { Layers } from "../components/layers.tsx";
import { Overlays } from "../components/overlays.tsx";
import { Brush } from "../components/brush.tsx";
import { Bounds } from "../components/bounds.tsx";
import { Handlers } from "../components/handlers.tsx";
import { Dimensions } from "../components/dimensions.tsx";

// export type for the editor components
// export type EditorComponentsMap = Record<string, ((props?: any) => React.JSX.Element) | null> | null;
export type EditorComponentsMap = {
    [key: string]: React.ElementType | any;
};

// @description editor components context
export const EditorComponentsContext = React.createContext<EditorComponentsMap>({} as EditorComponentsMap);

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
            // canvas components
            Overlays: Overlays,
            Brush: Brush,
            Bounds: Bounds,
            Handlers: Handlers,
            Dimensions: Dimensions,
            // general components
            Loading: Loading,
            Layout: Layout,
            ContextMenu: ContextMenu,
            // dialogs components
            ExportDialog: ExportDialog,
            KeyboardShortcutsDialog: KeyboardShortcutsDialog,
            Commands: Commands,
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
            // ai components
            AiChat: null,
            // canvas
            BehindTheCanvas: null,
            OverTheCanvas: null,
            // overrides
            ...props.components,
        };
    }, [props.components]);

    return (
        <EditorComponentsContext.Provider value={editorComponents}>
            {props.children}
        </EditorComponentsContext.Provider>
    );
};
