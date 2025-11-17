import React from "react";
import { AlbumIcon } from "@josemi-icons/react";
import { Alert } from "./ui/alert.tsx";
import { Island } from "./ui/island.jsx";
import { Panel } from "./ui/panel.tsx";
import { useEditorComponents } from "../contexts/editor-components.tsx";
import { useEditor } from "../contexts/editor.jsx";
import { useActions } from "../hooks/use-actions.js";
import { ACTIONS } from "../constants.js";

export type LayoutProps = {
    hideUi?: boolean,
    children: React.ReactNode,
};

// @description: default editor layout
// @param {object} props React props
// @param {React.ReactNode} props.children React children
export const Layout = (props: LayoutProps): React.JSX.Element => {
    const hideUi = props.hideUi ?? false;
    const [ sidebarVisible, setSidebarVisible ] = React.useState(false);
    const [ layersVisible, setLayersVisible ] = React.useState(false);
    const editor = useEditor();
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
    const showSidebarButton = true; // !!Library;

    return (
        <React.Fragment>
            {props.children}
            {!hideUi && (
                <React.Fragment>
                    <div className="absolute top-0 left-0 pt-4 pl-4 z-30 flex gap-2">
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
                        <div className="absolute top-0 right-0 pt-4 pr-4 z-30 flex gap-2">
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
                    {!!editor.page.readonly && (
                        <div className="absolute top-0 left-half pt-4 z-40 flex gap-2 translate-x-half-n pointer-events-none">
                            <Alert variant="warning" icon="lock">
                                This page is <b>Read-Only</b>.
                            </Alert>
                        </div>
                    )}
                    {!!Toolbar && (
                        <div className="absolute z-20 left-half bottom-0 mb-4" style={{transform:"translateX(-50%)"}}>
                            <Toolbar />
                        </div>
                    )}
                    {!!Minimap && (
                        <div className="absolute z-20 bottom-0 mb-4 left-0 ml-4">
                            <Minimap />
                        </div>
                    )}
                    {!editor.page.readonly && selectedElements.length > 0 && (
                        <React.Fragment>
                            {(selectedElements.length > 1 || !selectedElements[0].editing) && (
                                <div className="absolute z-20 top-0 mt-16 left-0 pt-1 pl-4">
                                    <EditionPanel
                                        key={selectedElements.map(el => el.id).join("-")}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    )}
                    {!!Layers && layersVisible && (
                        <div className="absolute z-30 top-0 right-0 pt-1 mt-16 mr-4">
                            <Layers />
                        </div>
                    )}
                    {sidebarVisible && (
                        <div className="absolute z-40 top-0 right-0 w-88 h-full">
                            <Panel className="h-full rounded-tr-none rounded-br-none">
                                <div class="flex items-center">
                                    <div class="w-full" />
                                    <Panel.Tabs className="hidden w-full">
                                    </Panel.Tabs>
                                    <Panel.Button
                                        icon="x"
                                        onClick={() => setSidebarVisible(!sidebarVisible)}
                                    />
                                </div>
                                <Panel.Body className="">
                                    Sidebar
                                </Panel.Body>
                            </Panel>
                        </div>
                    )}
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
