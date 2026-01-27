import React from "react";
import { Alert } from "./ui/alert.tsx";
import { Panel } from "./ui/panel.tsx";
import { Island } from "./ui/island.jsx";
import { useEditorComponents } from "../contexts/editor-components.tsx";
import { useEditor } from "../contexts/editor.jsx";
import { usePreferences } from "../contexts/preferences.tsx";
import { useActions } from "../hooks/use-actions.js";
import { ACTIONS, PREFERENCES } from "../constants.js";

export type LayoutProps = {
    hideUi?: boolean,
    children: React.ReactNode,
};

// @description: default editor layout
// @param {object} props React props
// @param {React.ReactNode} props.children React children
export const Layout = (props: LayoutProps): React.JSX.Element => {
    const hideUi = props.hideUi ?? false;
    const [ layersVisible, setLayersVisible ] = React.useState(false);
    const [ sidebarVisible, setSidebarVisible ] = React.useState(false);
    const editor = useEditor();
    const preferences = usePreferences();
    const dispatchAction = useActions();
    const {
        MainMenu,
        PagesMenu,
        SettingsMenu,
        Title,
        Toolbar,
        Layers,
        EditionPanel,
        HistoryPanel,
        Minimap,
        ZoomPanel,
        Library,
    } = useEditorComponents();

    // we need the selected elements list to display the edition panel
    const selectedElements = editor.getSelection();
    const isLibraryEnabled = !!preferences[PREFERENCES.LIBRARY_ENABLED] && !!Library;
    const showSidebarButton = isLibraryEnabled;

    return (
        <React.Fragment>
            {props.children}
            {!hideUi && (
                <div className="absolute top-0 left-0 flex items-stretch w-full h-full min-h-0 min-w-0 pointer-events-none">
                    <div className="grow-1 w-full h-full relative">
                        <div className="absolute top-0 left-0 pt-4 pl-4 z-30 flex gap-2 pointer-events-auto">
                            {!!MainMenu && (
                                <Island>
                                    <MainMenu />
                                </Island>
                            )}
                            <Island>
                                {!!Title && (
                                    <React.Fragment>
                                        <Title />
                                        <Island.Separator />
                                    </React.Fragment>
                                )}
                                {!!PagesMenu && <PagesMenu />}
                                {!!SettingsMenu && <SettingsMenu />}
                                <Island.Separator />
                                <Island.Button
                                    icon="trash"
                                    onClick={() => {
                                        dispatchAction(ACTIONS.CLEAR_PAGE);
                                    }}
                                    disabled={editor.page.readonly}
                                />
                            </Island>
                        </div>
                        {(!!HistoryPanel || !!ZoomPanel || !!Layers || showSidebarButton) && (
                            <div className="absolute top-0 right-0 pt-4 pr-4 z-30 flex gap-2 pointer-events-auto">
                                {!!HistoryPanel && <HistoryPanel />}
                                {!!ZoomPanel && <ZoomPanel />}
                                {!!Layers && (
                                    <Island>
                                        <Island.Button
                                            icon="stack"
                                            onClick={() => setLayersVisible(!layersVisible)}
                                            active={layersVisible}
                                        />
                                    </Island>
                                )}
                                {showSidebarButton && (
                                    <Island>
                                        <Island.Button
                                            icon="sidebar-right"
                                            onClick={() => setSidebarVisible(!sidebarVisible)}
                                            active={sidebarVisible}
                                        />
                                    </Island>
                                )}
                            </div>
                        )}
                        {!!Toolbar && (
                            <div className="absolute z-20 left-half bottom-0 mb-4 pointer-events-auto" style={{transform:"translateX(-50%)"}}>
                                <Toolbar />
                            </div>
                        )}
                        {!!Minimap && !!preferences[PREFERENCES.MINIMAP_ENABLED] && (
                            <div className="absolute z-20 bottom-0 mb-4 left-0 ml-4 pointer-events-auto">
                                <Minimap />
                            </div>
                        )}
                        {!editor.page.readonly && selectedElements.length > 0 && (
                            <React.Fragment>
                                {(selectedElements.length > 1 || !selectedElements[0].editing) && !!EditionPanel && (
                                    <div className="absolute z-20 top-0 mt-16 left-0 pt-1 pl-4 pointer-events-auto">
                                        <EditionPanel
                                            key={selectedElements.map((el: any) => el.id).join("-")}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        )}
                        {!!Layers && layersVisible && (
                            <div className="absolute z-30 top-0 right-0 pt-1 mt-16 mr-4 pointer-events-auto">
                                <Layers />
                            </div>
                        )}
                    </div>
                    {sidebarVisible && (
                        <div className="shrink-0 w-80 h-full pointer-events-auto">
                            <Panel className="relative h-full rounded-tr-none rounded-br-none">
                                <Panel.Body className="h-full">
                                    <div className="h-full max-h-full overflow-y-scroll">
                                        {isLibraryEnabled && (
                                            <Library />
                                        )}
                                    </div>
                                </Panel.Body>
                            </Panel>
                        </div>
                    )}
                </div>
            )}
        </React.Fragment>
    );
};
