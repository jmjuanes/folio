import React from "react";
import classNames from "classnames";
import {BarsIcon, CameraIcon, FilesIcon} from "@josemi-icons/react";
import {
    TOOLS,
    TRANSPARENT,
    PREFERENCES_FIELDS,
    MINIMAP_WIDTH,
    MINIMAP_HEIGHT,
    MINIMAP_POSITION,
} from "../constants.js";
import {useHandlers} from "../hooks/use-handlers.js";
import {useBounds} from "../hooks/use-bounds.js";
import {useCursor} from "../hooks/use-cursor.js";
import {useListeners} from "../hooks/use-editor.js";
import {useDimensions} from "../hooks/use-dimensions.js";
import {Island} from "./island.jsx";
import {Canvas} from "./canvas.jsx";
import {Pointer} from "./pointer.jsx";
import {ContextMenu} from "./context-menu.jsx";
import {Menu} from "./menu.jsx";
import {Title} from "./title.jsx";
import {Hint} from "./hint.jsx";
import {Screenshot} from "./screenshot.jsx";
import {PagesManager} from "./pages-manager.jsx";
import {ExportDialog} from "./dialogs/export.jsx";
import {LibraryAddDialog} from "./dialogs/library-add.jsx";
import {LibraryExportDialog} from "./dialogs/library-export.jsx";
import {PageConfigureDialog} from "./dialogs/page-configure.jsx";
import {PreferencesDialog} from "./dialogs/preferences.jsx";
import {WelcomeDialog} from "./dialogs/welcome.jsx";
import {ToolsPanel} from "./panels/tools.jsx";
import {EditionPanel} from "./panels/edition.jsx";
import {ZoomPanel} from "./panels/zoom.jsx";
import {HistoryPanel} from "./panels/history.jsx";
import {PagesPanel} from "./panels/pages.jsx";
import {LayersPanel} from "./panels/layers.jsx";
import {LibraryPanel} from "./panels/library.jsx";
import {SettingsPanel} from "./panels/settings.jsx";
import {MinimapPanel} from "./panels/minimap.jsx";
import {Alert} from "./ui/alert.jsx";
import {EditorProvider, useEditor} from "../contexts/editor.jsx";
import {LibraryProvider, useLibrary} from "../contexts/library.jsx";
import {useConfirm} from "../contexts/confirm.jsx";
import {ThemeProvider, themed} from "../contexts/theme.jsx";
import {PreferencesProvider, usePreferences} from "../contexts/preferences.jsx";
import {exportToFile, exportToClipboard} from "../export.js";
import {convertRegionToEditorCoordinates} from "../editor.js";
import {loadLibraryFromJson, saveLibraryAsJson} from "../library.js";

// @description export modes
const EXPORT_MODES = {
    FILE: "export-to-file",
    CLIPBOARD: "export-to-clipboard",
};

// @private inner editor component
const InnerEditor = props => {
    const editor = useEditor();
    const listeners = useListeners();
    const library = useLibrary();
    const [preferences, setPreferences] = usePreferences();
    const {showConfirm} = useConfirm();
    const cursor = useCursor();
    const bounds = useBounds();
    const handlers = useHandlers();
    const dimensions = useDimensions();
    const [contextMenuPosition, setContextMenuPosition] = React.useState(null);

    const selectedElements = editor.getSelection();
    const isScreenshot = false; // editor.state.action === ACTIONS.SCREENSHOT;

    // Handle tool or action change
    const handleToolOrActionChange = React.useCallback(newTool => {
        editor.state.tool = newTool;
        editor.getElements().forEach(element => {
            element.selected = false;
            element.editing = false;
        });
        setContextMenuPosition(null);
    }, []);

    // handle export to file or clipboard
    const handleExport = React.useCallback((mode, exportElements, exportOptions) => {
        let exportPromise = null;
        switch (mode) {
            case EXPORT_MODES.FILE:
                exportPromise = exportToFile(exportElements, exportOptions);
            case EXPORT_MODES.CLIPBOARD:
                exportPromise = exportToClipboard(exportElements, exportOptions);
        }
        // TODO: display a notification if the export is successful
        return exportPromise.catch(error => console.error(error));
    }, []);

    // handle context menu in canvas
    const handleContextMenu = React.useCallback(event => {
        if (editor.state.tool === TOOLS.SELECT) {
            // editor.state.status = STATUS.IDLE;
            setContextMenuPosition({
                top: event.y,
                left: event.x,
            });
        }
    }, []);

    // Effect to disable the visibility of the welcome elements
    React.useEffect(() => {
        // if (editor.state.hintsVisible && editor?.page?.elements?.length > 0) {
        //     editor.state.hintsVisible = false;
        //     editor.update();
        // }
    }, [editor?.page?.elements?.length]);

    // Hook to reset the action and tool when we change the active page
    React.useEffect(() => {
        // const action = editor.state.action;
        if (editor.page.readonly && editor.state.tool !== TOOLS.DRAG) {
            handleToolOrActionChange(TOOLS.DRAG);
        }
    }, [editor.page.id, editor.page.readonly, editor.state.tool]);

    // Hook to hide the context menu
    React.useEffect(() => {
        if (contextMenuPosition) {
            setContextMenuPosition(null);
        }
    }, [editor.state.tool]);

    return (
        <div className={themed("relative overflow-hidden h-full w-full select-none", "editor")}>
            <Canvas
                id={editor.id}
                elements={editor.page.elements}
                assets={editor.assets}
                backgroundColor={editor.background}
                cursor={cursor}
                translateX={editor.page.translateX}
                translateY={editor.page.translateY}
                zoom={editor.page.zoom}
                snaps={editor.state.snapEdges}
                bounds={bounds}
                showBounds={!!bounds}
                handlers={handlers}
                brush={editor.state.selection}
                dimensions={dimensions}
                showBrush={editor.state.tool === TOOLS.SELECT}
                showPointer={editor.state.tool === TOOLS.ERASER}
                showGrid={editor.appState.grid}
                showSnaps={editor.appState.snapToElements}
                showObjectDimensions={editor.appState.objectDimensions}
                onContextMenu={handleContextMenu}
                {...listeners}
            />
            {editor.state.tool === TOOLS.POINTER && (
                <Pointer />
            )}
            {!!contextMenuPosition &&  (
                <ContextMenu
                    top={contextMenuPosition.top}
                    left={contextMenuPosition.left}
                    onDuplicate={() => {
                        editor.duplicateElements(editor.getSelection());
                        editor.dispatchChange();
                        setContextMenuPosition(null);
                    }}
                    onLock={() => {
                        editor.lockElements(editor.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onUnlock={() => {
                        editor.unlockElements(editor.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onGroup={() => {
                        editor.groupElements(editor.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onUngroup={() => {
                        editor.ungroupElements(editor.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onCut={() => {
                        const elements = editor.getSelection();
                        editor.cutElementsToClipboard(elements).then(() => {
                            editor.dispatchChange();
                            setContextMenuPosition(null);
                        });
                    }}
                    onCopy={() => {
                        const elements = editor.getSelection();
                        editor.copyElementsToClipboard(elements).then(() => {
                            editor.dispatchChange();
                            setContextMenuPosition(null);
                        });
                    }}
                    onPaste={() => {
                        const x = contextMenuPosition.left;
                        const y = contextMenuPosition.top;
                        editor.pasteElementsFromClipboard(null, {x, y}).then(() => {
                            editor.dispatchChange();
                            setContextMenuPosition(null);
                        });
                    }}
                    onSendBackward={() => {
                        editor.sendElementsBackward(editor.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onBringForward={() => {
                        editor.bringElementsForward(editor.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onSelectAll={() => {
                        editor.getElements().forEach(el => el.selected = true);
                        setContextMenuPosition(null);
                    }}
                    onDelete={() => {
                        editor.removeElements(editor.getSelection());
                        editor.dispatchChange();
                        setContextMenuPosition(null);
                    }}
                    onAddToLibrary={() => {
                        editor.state.libraryAddVisible = true;
                        setContextMenuPosition(null);
                    }}
                />
            )}
            {!isScreenshot && (
                <div className="absolute z-20 left-half bottom-0 mb-4" style={{transform:"translateX(-50%)"}}>
                    <ToolsPanel />
                    {(editor.state.hintsVisible && !editor.state.tool) && (
                        <Hint
                            position="top"
                            title="Tools Panel"
                            contentClassName="w-48 text-center"
                            content="All the available tools. Pick one and start drawing!"
                        />
                    )}
                </div>
            )}
            {!isScreenshot && preferences[PREFERENCES_FIELDS.MINIMAP_VISIBLE] && (
                <div
                    className={classNames("absolute z-20 bottom-0 mb-4", {
                        "left-0 ml-4": preferences[PREFERENCES_FIELDS.MINIMAP_POSITION] === MINIMAP_POSITION.BOTTOM_LEFT,
                        "right-0 mr-4": preferences[PREFERENCES_FIELDS.MINIMAP_POSITION] === MINIMAP_POSITION.BOTTOM_RIGHT,
                    })}
                >
                    <MinimapPanel
                        width={preferences[PREFERENCES_FIELDS.MINIMAP_WIDTH] ?? MINIMAP_WIDTH}
                        height={preferences[PREFERENCES_FIELDS.MINIMAP_HEIGHT] ?? MINIMAP_HEIGHT}
                    />
                </div>
            )}
            {!editor.page.readonly && selectedElements.length > 0 && (
                <React.Fragment>
                    {(selectedElements.length > 1 || !selectedElements[0].editing) && (
                        <div className="absolute z-30 top-0 mt-16 right-0 pt-1 pr-4">
                            <EditionPanel
                                key={selectedElements.map(el => el.id).join("-")}
                                onChange={() => {
                                    editor.dispatchChange();
                                    editor.update();
                                }}
                            />
                        </div>
                    )}
                </React.Fragment>
            )}
            {!editor.page.readonly && editor.state.layersVisible && !isScreenshot && (
                <div className="absolute z-30 top-0 mt-16 right-0 pt-1 pr-4">
                    <LayersPanel
                        key={`layers:${editor.id || ""}:${editor.page.id || ""}`}
                        onElementSelect={element => {
                            // if (!editor.state.action || editor.state.action === ACTIONS.SELECT) {
                            if (editor.state.tool === TOOLS.SELECT) {
                                if (element?.group) {
                                    editor.page.activeGroup = element.group;
                                }
                                editor.selectElements([element]);
                                editor.update();
                            }
                        }}
                        onElementDuplicate={element => {
                            editor.duplicateElements([element]);
                            editor.dispatchChange();
                            editor.update();
                        }}
                        onElementDelete={element => {
                            editor.removeElements([element]);
                            editor.dispatchChange();
                            editor.update();
                        }}
                        onElementRename={() => {
                            editor.dispatchChange();
                            editor.update();
                        }}
                    />
                </div>
            )}
            {!editor.page.readonly && editor.state.libraryVisible && !isScreenshot && (
                <div className="absolute z-30 top-0 mt-16 right-0 pt-1 pr-4">
                    <LibraryPanel
                        key={`library:${editor.id || ""}`}
                        onCreate={() => {
                            editor.state.libraryCreateVisible = true;
                            editor.update();
                        }}
                        onLoad={() => {
                            loadLibraryFromJson()
                                .then(importedLibrary => {
                                    library.importLibrary(importedLibrary);
                                    editor.dispatchLibraryChange();
                                    editor.update();
                                })
                                .catch(error => {
                                    console.error(error);
                                });
                        }}
                        onClear={() => {
                            showConfirm({
                                title: "Delete library",
                                message: `Do you want to delete your library? This action can not be undone.`,
                                callback: () => {
                                    library.clear();
                                    editor.dispatchLibraryChange();
                                    editor.update();
                                },
                            });
                        }}
                        onExport={() => {
                            editor.state.libraryExportVisible = true;
                            editor.update();
                        }}
                        onInsertItem={(item, tx, ty) => {
                            editor.addLibraryItem(item, tx, ty);
                            editor.state.libraryVisible = false; // hide library panel
                            editor.dispatchChange();
                            editor.update();
                        }}
                        onDeleteItem={item => {
                            showConfirm({
                                title: "Delete library item",
                                message: `Do you want to delete '${item.name}'? This action can not be undone.`,
                                callback: () => {
                                    library.delete(item.id);
                                    editor.dispatchLibraryChange();
                                    editor.update();
                                },
                            });
                        }}
                        onDeleteAll={ids => {
                            showConfirm({
                                title: "Delete library items",
                                message: `Do you want to delete ${ids.length} items from the library? This action can not be undone.`,
                                callback: () => {
                                    library.delete(ids);
                                    editor.dispatchLibraryChange();
                                    editor.update();
                                },
                            });
                        }}
                    />
                </div>
            )}
            {editor.state.pagesVisible && !isScreenshot && (
                <div className="absolute z-20 top-0 mt-16 left-0 pt-1 pl-4">
                    <PagesPanel
                        key={`pages:${editor.id || ""}:${editor.pages.length}`}
                        editable={true}
                        onChangeActivePage={page => {
                            editor.setActivePage(page);
                            editor.update();
                        }}
                        onPageCreate={() => {
                            editor.addPage({});
                            editor.dispatchChange();
                            editor.update();
                        }}
                        onPageConfigure={page => {
                            editor.state.selectedPage = page;
                            editor.state.pageConfigureVisible = true;
                            editor.update();
                        }}
                        onPageDuplicate={page => {
                            editor.duplicatePage(page);
                            editor.dispatchChange();
                            editor.update();
                        }}
                        onPageDelete={page => {
                            return showConfirm({
                                title: "Delete page",
                                message: `Do you want to delete '${page.title}'? This action can not be undone.`,
                                callback: () => {
                                    editor.removePage(page);
                                    editor.dispatchChange();
                                    editor.update();
                                },
                            });
                        }}
                        onPageMove={(page, nextIndex) => {
                            editor.movePage(page, nextIndex);
                            editor.dispatchChange();
                            editor.update();
                        }}
                    />
                </div>
            )}
            {!isScreenshot && (
                <React.Fragment>
                    <div className="absolute top-0 left-0 pt-4 pl-4 z-20 flex gap-2">
                        <div className="relative flex">
                            <Island>
                                <Menu />
                                <Island.Separator />
                                {props.showTitle && (
                                    <React.Fragment>
                                        <Title />
                                        <Island.Separator />
                                    </React.Fragment>
                                )}
                                <Island.Button
                                    icon="files"
                                    text={(
                                        <div className="w-32 truncate">
                                            <span>{editor.getActivePage().title}</span>
                                        </div>
                                    )}
                                    showChevron={true}
                                    active={false && editor.state.pagesVisible}
                                    onClick={() => {
                                        editor.state.pagesVisible = !editor.state.pagesVisible;
                                        editor.state.contextMenu = false;
                                        editor.update();
                                    }}
                                />
                                <div className="flex relative group" tabIndex="0">
                                    <Island.Button icon="sliders" />
                                    <div className="hidden absolute group-focus-within:block top-full left-0 mt-2 z-40">
                                        <SettingsPanel
                                            onChange={() => {
                                                editor.dispatchChange();
                                                editor.update();
                                            }}
                                        />
                                    </div>
                                </div>
                                <Island.Button
                                    icon="trash"
                                    disabled={editor.page.readonly || editor.getElements().length === 0}
                                    onClick={() => {
                                        return showConfirm({
                                            title: "Clear Page",
                                            message: "This will remove all elements of this page. Do you want to continue?",
                                            confirmText: "Yes, clear page",
                                            callback: () => {
                                                editor.clearPage(editor.page.id);
                                                editor.dispatchChange();
                                                editor.update();
                                            },
                                        });
                                    }}
                                />
                                {props.showScreenshot && (
                                    <Island.Button
                                        icon="camera"
                                        disabled={editor.getElements().length === 0}
                                        onClick={() => {
                                            // handleToolOrActionChange(null, ACTIONS.SCREENSHOT);
                                        }}
                                    />
                                )}
                                <Island.Button
                                    icon="grid"
                                    onClick={() => {
                                        // handleToolOrActionChange(null, ACTIONS.PAGES_MANAGER);
                                    }}
                                />
                            </Island>
                            {(editor.state.hintsVisible && !editor.state.tool && !editor.state.pagesVisible) && (
                                <Hint position="bottom" title="Actions" contentClassName="w-48">
                                    <div className="flex items-center justify-center gap-2">
                                        <BarsIcon />
                                        <span>Export, save, and configure.</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <FilesIcon />
                                        <span>Change and manage pages.</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <CameraIcon />
                                        <span>Take a screenshot.</span>
                                    </div>
                                </Hint>
                            )}
                        </div>
                        {props.headerLeftContent}
                    </div>
                    <div className="absolute top-0 right-0 pt-4 pr-4 z-40 flex gap-2">
                        <div className="flex relative">
                            <HistoryPanel />
                            {(editor.state.hintsVisible && !editor.state.tool && !editor.state.layersVisible) && (
                                <Hint
                                    position="bottom"
                                    title="History"
                                    contentClassName="w-24 text-center"
                                    content="Undo and redo changes."
                                />
                            )}
                        </div>
                        <div className="flex relative">
                            <ZoomPanel />
                            {(editor.state.hintsVisible && !editor.state.tool && !editor.state.layersVisible) && (
                                <Hint
                                    position="bottom"
                                    title="Zoom"
                                    contentClassName="w-24 text-center"
                                    content="Apply zoom to the board."
                                />
                            )}
                        </div>
                        <div className="">
                            <Island>
                                <Island.Button
                                    icon="edit"
                                    active={!editor.page.readonly && !editor.state.layersVisible && !editor.state.libraryVisible}
                                    disabled={editor.page.readonly}
                                    onClick={() => {
                                        editor.state.layersVisible = false;
                                        editor.state.libraryVisible = false;
                                        editor.update();
                                    }}
                                />
                                <Island.Button
                                    icon="stack"
                                    active={!editor.page.readonly && editor.state.layersVisible}
                                    disabled={editor.page.readonly}
                                    onClick={() => {
                                        editor.state.layersVisible = true;
                                        editor.state.libraryVisible = false;
                                        editor.update();
                                    }}
                                />
                                <Island.Button
                                    icon="album"
                                    active={!editor.page.readonly && editor.state.libraryVisible}
                                    disabled={editor.page.readonly}
                                    onClick={() => {
                                        editor.state.layersVisible = false;
                                        editor.state.libraryVisible = true;
                                        editor.update();
                                    }}
                                />
                            </Island>
                        </div>
                        {props.headerRightContent}
                    </div>
                    {editor.page.readonly && (
                        <div className="absolute top-0 left-half pt-4 z-30 flex gap-2 translate-x-half-n pointer-events-none">
                            <Alert variant="warning" icon="lock">
                                This page is <b>Read-Only</b>.
                            </Alert>
                        </div>
                    )}
                </React.Fragment>
            )}
            {isScreenshot && (
                <Screenshot
                    onDownload={(region, options) => {
                        handleExport(EXPORT_MODES.FILE, editor.getElements(), {
                            background: options?.background ? editor.background : TRANSPARENT,
                            crop: convertRegionToEditorCoordinates(editor, region),
                        });
                        // editor.state.action = null;
                        editor.update();
                    }}
                    onCopyToClipboard={(region, options) => {
                        handleExport(EXPORT_MODES.CLIPBOARD, editor.getElements(), {
                            background: options?.background ? editor.background : TRANSPARENT,
                            crop: convertRegionToEditorCoordinates(editor, region),
                        });
                        // editor.state.action = null;
                        editor.update();
                    }}
                    onCancel={() => {
                        // editor.state.action = null;
                        editor.update();
                    }}
                />
            )}
            {false && (
                <PagesManager
                    onChangeActivePage={page => {
                        editor.setActivePage(page);
                        editor.update();
                    }}
                    onPageCreate={index => {
                        editor.addPage({}, index, true);
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onPageDuplicate={page => {
                        [page].flat().forEach(page => editor.duplicatePage(page));
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onPageDelete={page => {
                        const pages = [page].flat();
                        return showConfirm({
                            title: "Delete page",
                            message: `Do you want to delete ${pages.length === 1 ? `'${pages[0].title}'` : `${pages.length} pages`}? This action can not be undone.`,
                            callback: () => {
                                pages.forEach(page => editor.removePage(page));
                                editor.dispatchChange();
                                editor.update();
                            },
                        });
                    }}
                    onPageMove={(page, nextIndex) => {
                        editor.movePage(page, nextIndex);
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onCancel={() => {
                        // editor.state.action = null;
                        editor.update();
                    }}
                />
            )}
            {editor.state.welcomeVisible && (
                <WelcomeDialog
                    onCreate={() => {
                        editor.state.welcomeVisible = false;
                        editor.update();
                    }}
                    onLoad={handleLoad}
                />
            )}
            {editor.state.exportVisible && (
                <ExportDialog
                    onDownload={(exportElements, exportOptions) => {
                        handleExport(EXPORT_MODES.FILE, exportElements, exportOptions);
                        editor.state.exportVisible = false;
                        editor.update();
                    }}
                    onCopyToClipboard={(exportElements, exportOptions) => {
                        handleExport(EXPORT_MODES.CLIPBOARD, exportElements, exportOptions);
                        editor.state.exportVisible = false;
                        editor.update();
                    }}
                    onCancel={() => {
                        editor.state.exportVisible = false;
                        editor.update();
                    }}
                />
            )}
            {editor.state.libraryAddVisible && (
                <LibraryAddDialog
                    onAdd={(elements, data) => {
                        library.add(elements, data).then(() => {
                            editor.state.libraryAddVisible = false;
                            editor.dispatchLibraryChange();
                            editor.update();
                        });
                    }}
                    onCancel={() => {
                        editor.state.libraryAddVisible = false;
                        editor.update();
                    }}
                />
            )}
            {editor.state.libraryExportVisible && (
                <LibraryExportDialog
                    onExport={data => {
                        editor.state.libraryExportVisible = false;
                        editor.update();
                        const exportLibrary = Object.assign(library.toJSON(), {
                            name: data.name,
                            description: data.description,
                            items: library.items.filter(item => data.selectedItems.has(item.id)),
                        });
                        saveLibraryAsJson(exportLibrary)
                            .then(() => console.log("Library saved"))
                            .catch(error => console.error(error));
                    }}
                    onCancel={() => {
                        editor.state.libraryExportVisible = false;
                        editor.update();
                    }}
                />
            )}
            {editor.state.pageConfigureVisible && (
                <PageConfigureDialog
                    page={editor.state.selectedPage?.id}
                    title={editor.state.selectedPage?.title || ""}
                    onSubmit={data => {
                        Object.assign(editor.state.selectedPage, data);
                        // Check if the edited page is the active page
                        if (editor.page.id === editor.state.selectedPage.id) {
                            // editor.state.tool = null;
                            editor.state.contextMenu = false;
                            // if (editor.state.action !== ACTIONS.MOVE && editor.state.action !== ACTIONS.POINTER) {
                            //     editor.state.action = ACTIONS.MOVE;
                            // }
                            // Reset selected elements and editing state
                            editor.getElements().forEach(element => {
                                element.selected = false;
                                element.editing = false;
                            });
                        }
                        editor.state.selectedPage = null; // reset selected page
                        editor.state.pageConfigureVisible = false;
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onCancel={() => {
                        editor.state.pageConfigureVisible = false;
                        editor.state.selectedPage = null;
                        editor.update();
                    }}
                />
            )}
            {editor.state.preferencesVisible && (
                <PreferencesDialog
                    onSubmit={data => {
                        setPreferences(data);
                        editor.state.preferencesVisible = false;
                        editor.update();
                    }}
                    onCancel={() => {
                        editor.state.preferencesVisible = false;
                        editor.update();
                    }}
                />
            )}
        </div>
    );
};

// @description Public editor
export const Editor = ({initialData, initialLibraryData, initialPreferences, ...props}) => {
    return (
        <PreferencesProvider initialData={initialPreferences} onChange={props.onPreferencesChange}>
            <ThemeProvider theme="default">
                <LibraryProvider initialData={initialLibraryData} onChange={props.onLibraryChange}>
                    <EditorProvider initialData={initialData} onChange={props.onChange}>
                        <InnerEditor {...props} />
                    </EditorProvider>
                </LibraryProvider>
            </ThemeProvider>
        </PreferencesProvider>
    );
};

Editor.defaultProps = {
    initialData: null,
    links: [],
    headerLeftContent: null,
    headerRightContent: null,
    onChange: null,
    onSave: null,
    onLoad: null,
    showLoad: true,
    showSave: true,
    showClear: true,
    showChangeBackground: true,
    showScreenshot: true,
    showExport: true,
    showHints: true,
    showWelcome: true,
    showTitle: true,
};
