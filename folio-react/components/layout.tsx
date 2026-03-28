import React from "react";
import { renderIcon } from "@josemi-icons/react";
import { Panel } from "./ui/panel.tsx";
import { Island } from "./ui/island.tsx";
import { useEditorComponents } from "../contexts/editor-components.tsx";
import { useEditor } from "../contexts/editor.tsx";
import { usePreferences } from "../contexts/preferences.tsx";
import { useActions } from "../hooks/use-actions.js";
import { ACTIONS, PREFERENCES } from "../constants.js";

export type LayoutProps = {
    hideUi?: boolean,
    children: React.ReactNode,
};

export enum SidebarTab {
    LIBRARY = "library",
    AI = "ai",
};

// list of sidebar tabs
export const sidebarTabs = [
    { value: SidebarTab.LIBRARY, label: "Library", icon: "album" },
    { value: SidebarTab.AI, label: "AI", icon: "sparkles" },
];

// @description: default editor layout
// @param {object} props React props
// @param {React.ReactNode} props.children React children
export const Layout = (props: LayoutProps): React.JSX.Element => {
    const hideUi = props.hideUi ?? false;
    const [layersVisible, setLayersVisible] = React.useState(false);
    const [sidebarVisible, setSidebarVisible] = React.useState(false);
    const [sidebarTab, setSidebarTab] = React.useState<SidebarTab | null>(null);
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
        AiChat,
    } = useEditorComponents();

    // we need the selected elements list to display the edition panel
    const selectedElements = editor.getSelection();
    const isLibraryEnabled = !!preferences[PREFERENCES.LIBRARY_ENABLED] && !!Library;
    const isAiChatEnabled = !!preferences[PREFERENCES.AI_ENABLED] && !!AiChat;
    const showSidebarButton = isLibraryEnabled || isAiChatEnabled;

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
                                {isAiChatEnabled && (
                                    <Island.Button
                                        icon="sparkles"
                                        iconClassName="text-white"
                                        onClick={() => {
                                            setSidebarVisible(true);
                                            setSidebarTab(SidebarTab.AI);
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
                                            onClick={() => {
                                                // note: the default active tab when the sidebar is visible is one of the two available tabs
                                                // we set it to the library tab if the library is enabled, otherwise we set it to the AI tab
                                                setSidebarVisible(!sidebarVisible);
                                                // setSidebarTab(isLibraryEnabled ? SidebarTab.LIBRARY : SidebarTab.AI);
                                                setSidebarTab(SidebarTab.AI);
                                            }}
                                            active={sidebarVisible}
                                        />
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
                        {!!Layers && layersVisible && (
                            <div className="absolute z-30 top-0 right-0 pt-1 mt-16 mr-4 pointer-events-auto">
                                <Layers />
                            </div>
                        )}
                    </div>
                    {sidebarVisible && (
                        <div className="shrink-0 w-88 h-full pointer-events-auto">
                            <Panel className="relative h-full rounded-tr-none rounded-br-none overflow-hidden flex flex-col min-h-0">
                                {isLibraryEnabled && isAiChatEnabled && (
                                    <Panel.Tabs>
                                        {sidebarTabs.map((tab: any) => (
                                            <Panel.TabsItem key={tab.value} active={sidebarTab === tab.value} onClick={() => setSidebarTab(tab.value)}>
                                                <div className="flex items-center gap-1">
                                                    <div className="flex items-center">
                                                        {renderIcon(tab.icon)}
                                                    </div>
                                                    <div className="text-sm font-bold">{tab.label}</div>
                                                </div>
                                            </Panel.TabsItem>
                                        ))}
                                    </Panel.Tabs>
                                )}
                                {sidebarTab === SidebarTab.LIBRARY && isLibraryEnabled && (
                                    <Library />
                                )}
                                {sidebarTab === SidebarTab.AI && isAiChatEnabled && (
                                    <AiChat />
                                )}
                            </Panel>
                        </div>
                    )}
                </div>
            )}
        </React.Fragment>
    );
};
