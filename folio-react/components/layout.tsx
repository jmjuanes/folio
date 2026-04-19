import React from "react";
import { Panel } from "./ui/panel.tsx";
import { Island } from "./ui/island.tsx";
import { useEditorComponents } from "../contexts/editor-components.tsx";
import { useEditor } from "../contexts/editor.tsx";
import { usePreferences } from "../contexts/preferences.tsx";
import { useActions } from "../contexts/actions.tsx";
import { PanelSlot, useShellPanels } from "../contexts/shell.tsx";
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
    const editor = useEditor();
    const preferences = usePreferences();
    const { dispatchAction } = useActions();
    const { isPanelOpen } = useShellPanels();
    const {
        MainMenu,
        PagesMenu,
        SettingsMenu,
        Title,
        Toolbar,
        EditionPanel,
        HistoryPanel,
        Minimap,
        Zoom,
        Library,
        Layers,
    } = useEditorComponents();

    // we need the selected elements list to display the edition panel
    const selectedElements = editor.getSelection();
    const isLibraryPanelEnabled = !!preferences[PREFERENCES.LIBRARY_ENABLED] && !!Library;
    const isLayersPanelEnabled = !!Layers;
    const showPanelsButtons = isLayersPanelEnabled || isLibraryPanelEnabled;

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
                                {false && (
                                    <Island.Button
                                        icon="sparkles"
                                        iconClassName="text-white"
                                        onClick={() => {
                                            return null;
                                        }}
                                        style={{
                                            background: "linear-gradient(60deg, #4A74E6, #8D54E9)",
                                        }}
                                    />
                                )}
                                <Island.Button
                                    icon="trash"
                                    onClick={() => {
                                        dispatchAction(ACTIONS.CLEAR_PAGE, editor.page);
                                    }}
                                    disabled={editor.page.readonly}
                                />
                            </Island>
                        </div>
                        {(!!HistoryPanel || !!Zoom || showPanelsButtons) && (
                            <div className="absolute top-0 right-0 pt-4 pr-4 z-30 flex gap-2 pointer-events-auto">
                                {!!HistoryPanel && <HistoryPanel />}
                                {!!Zoom && <Zoom />}
                                {!!showPanelsButtons && (
                                    <Island>
                                        {isLayersPanelEnabled && (
                                            <Island.Button
                                                icon="stack"
                                                onClick={() => {
                                                    dispatchAction(ACTIONS.TOGGLE_LAYERS_PANEL);
                                                }}
                                                active={isPanelOpen("layers")}
                                            />
                                        )}
                                        {isLibraryPanelEnabled && (
                                            <Island.Button
                                                icon="album"
                                                onClick={() => {
                                                    dispatchAction(ACTIONS.TOGGLE_LIBRARY_PANEL);
                                                }}
                                                active={isPanelOpen("library")}
                                            />
                                        )}
                                    </Island>
                                )}
                            </div>
                        )}
                        {!!Toolbar && (
                            <div className="absolute z-20 left-half bottom-0 mb-4 pointer-events-auto" style={{ transform: "translateX(-50%)" }}>
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
                        <PanelSlot id="layers" render={(content) => (
                            <div className="absolute z-30 top-0 right-0 pt-1 mt-16 mr-4 pointer-events-auto">
                                {content}
                            </div>
                        )} />
                    </div>
                    <PanelSlot id="library" render={(content) => (
                        <div className="shrink-0 w-88 h-full pointer-events-auto">
                            <Panel className="relative h-full rounded-tr-none rounded-br-none overflow-hidden flex flex-col min-h-0">
                                {content}
                            </Panel>
                        </div>
                    )} />
                </div>
            )}
        </React.Fragment>
    );
};
