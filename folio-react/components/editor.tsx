import { Fragment } from "react";
import { EditorProvider, useEditor } from "../contexts/editor.tsx";
import { EditorComponentsProvider, useEditorComponents } from "../contexts/editor-components.tsx";
import { LibraryProvider } from "../contexts/library.tsx";
import { PreferencesProvider, usePreferences } from "../contexts/preferences.tsx";
import { ToolsProvider } from "../contexts/tools.tsx";
import { ActionsProvider, useActions} from "../contexts/actions.tsx";
import { WorkbenchProvider, WorkbenchSlot, Part, useWorkbench } from "../contexts/workbench.tsx";
import { Canvas } from "./canvas.tsx";
import { Island } from "./ui/island.tsx";
import { ACTIONS, PREFERENCES } from "../constants.js";
import type { JSX, PropsWithChildren } from "react";
import type { ToolsOverrides } from "../contexts/tools.tsx";
import type { ActionsOverrides } from "../contexts/actions.tsx";
import type { Library } from "../lib/library.ts";
import type { View } from "../contexts/workbench.tsx";

// @description component that wrapps all UI for the editor
export const EditorUi = (props: PropsWithChildren): JSX.Element => {
    return (
        <Fragment>
            {props.children}
            <div className="absolute top-0 left-0 w-full h-full min-h-0 min-w-0 p-4 pointer-events-none">
                <div className="flex flex-row gap-2 w-full h-full">
                    <div className="grow-1 flex flex-col gap-2 items-stretch w-full h-full">
                        <WorkbenchSlot part={Part.TITLEBAR} render={content => (
                            <div className="relative w-full">
                                {content}
                            </div>
                        )} />
                        <div className="flex items-stretch gap-2 grow-1">
                            <WorkbenchSlot part={Part.SIDEBAR} render={content => (
                                <div className="relative h-full flex flex-col items-stretch gap-2">
                                    {content}
                                </div>
                            )} />
                            <div className="relative grow-1">
                                <WorkbenchSlot part={Part.CANVAS} />
                            </div>
                        </div>
                    </div>
                    <WorkbenchSlot part={Part.AUXILIARYBAR} render={content => (
                        <div className="relative h-full flex flex-col items-stretch gap-2">
                            {content}
                        </div>
                    )} />
                </div>
                <WorkbenchSlot part={Part.STATUSBAR} render={content => (
                    <div className="relative w-full">
                        {content}
                    </div>
                )} />
            </div>
            <WorkbenchSlot part={Part.SURFACE} />
        </Fragment>
    );
};

export const InsideEditorWithUi = (): JSX.Element => {
    const { BehindTheCanvas, OverTheCanvas, Overlays } = useEditorComponents();
    return (
        <Fragment>
            {!!BehindTheCanvas && (
                <BehindTheCanvas />
            )}
            <Canvas>
                {!!Overlays && (
                    <Overlays />
                )}
            </Canvas>
            {!!OverTheCanvas && (
                <OverTheCanvas />
            )}
        </Fragment>
    );
};

// @description component tht wraps all components that composes the titlebar of the editor
export const EditorTitlebar = (): JSX.Element => {
    const editor = useEditor();
    const preferences = usePreferences();
    const { dispatchAction } = useActions();
    const { isViewOpen } = useWorkbench();
    const {
        MainMenu,
        PagesMenu,
        SettingsMenu,
        Title,
        History,
        Zoom,
        Library,
    } = useEditorComponents();
    return (
        <div className="w-full flex justify-between">
            <div className="z-30 flex gap-2 pointer-events-auto">
                {!!MainMenu && (
                    <Island>
                        <MainMenu />
                    </Island>
                )}
                <Island>
                    {!!Title && (
                        <Fragment>
                            <Title />
                            <Island.Separator />
                        </Fragment>
                    )}
                    {!!PagesMenu && <PagesMenu />}
                    {!!SettingsMenu && <SettingsMenu />}
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
                    {!!Library && !!preferences[PREFERENCES.LIBRARY_ENABLED] && (
                        <Island.Button
                            icon="album"
                            onClick={() => {
                                dispatchAction(ACTIONS.TOGGLE_LIBRARY_PANEL);
                            }}
                            active={isViewOpen(Part.AUXILIARYBAR, Library)}
                        />
                    )}
                    <Island.Separator />
                    <Island.Button
                        icon="trash"
                        onClick={() => {
                            dispatchAction(ACTIONS.CLEAR_PAGE, editor.page);
                        }}
                        disabled={editor.page.readonly}
                    />
                </Island>
            </div>
            {(!!History || !!Zoom) && (
                <div className="z-30 flex gap-2 pointer-events-auto">
                    {!!History && <History />}
                    {!!Zoom && <Zoom />}
                </div>
            )}
        </div>
    );
};

export const EditorCanvasOverlay = (): JSX.Element => {
    const editor = useEditor();
    const preferences = usePreferences();
    const { Toolbar, Layers, Minimap, Style } = useEditorComponents();
    const selectedElements = editor.getSelection();
    return (
        <Fragment>
            {!!Toolbar && (
                <div className="absolute z-20 left-half bottom-0 pointer-events-auto" style={{ transform: "translateX(-50%)" }}>
                    <Toolbar />
                </div>
            )}
            {!!Layers && (
                <div className="absolute z-30 top-0 right-0 pointer-events-auto">
                    <Layers />
                </div>
            )}
            {!!Minimap && !!preferences[PREFERENCES.MINIMAP_ENABLED] && (
                <div className="absolute z-20 bottom-0 left-0 pointer-events-auto">
                    <Minimap />
                </div>
            )}
            {(!!Style && !editor.page.readonly && selectedElements.length > 0 && (selectedElements.length > 1 || !selectedElements[0].editing)) && (
                <div className="absolute z-20 top-0 left-0 pointer-events-auto">
                    <Style
                        key={selectedElements.map((el: any) => el.id).join("-")}
                    />
                </div>
            )}
        </Fragment>
    );
};

// default views for editor workbench
const defaultWorkbenchViews = [
    {
        part: Part.TITLEBAR,
        component: EditorTitlebar,
        context: {},
    },
    {
        part: Part.CANVAS,
        component: EditorCanvasOverlay,
        context: {},
    },
] as View[];

export type EditorOverrides = {
    actions?: ActionsOverrides;
    tools?: ToolsOverrides;
};

export type EditorProps = {
    components?: any;
    data?: any;
    library?: any;
    preferences?: any;
    tools?: any[];
    overrides?: EditorOverrides | null,
    onChange?: (data: any) => void;
    onLibraryChange?: (library: Library) => void;
};

// @description Public editor
export const Editor = (props: EditorProps): JSX.Element => {
    return (
        <PreferencesProvider preferences={props.preferences}>
            <EditorComponentsProvider components={props.components}>
                <LibraryProvider data={props.library} onChange={props.onLibraryChange}>
                    <EditorProvider {...props}>
                        <ToolsProvider overrides={props.overrides?.tools}>
                            <WorkbenchProvider initialViews={defaultWorkbenchViews}>
                                <ActionsProvider overrides={props.overrides?.actions}>
                                    <EditorUi>
                                        <InsideEditorWithUi />
                                    </EditorUi>
                                </ActionsProvider>
                            </WorkbenchProvider>
                        </ToolsProvider>
                    </EditorProvider>
                </LibraryProvider>
            </EditorComponentsProvider>
        </PreferencesProvider>
    );
};
