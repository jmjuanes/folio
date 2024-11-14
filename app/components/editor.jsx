import React from "react";
import classNames from "classnames";
import {fileOpen} from "browser-fs-access";
import {BarsIcon, CameraIcon, FilesIcon, LockIcon} from "@josemi-icons/react";
import {
    ACTIONS,
    ELEMENTS,
    FILE_EXTENSIONS,
    STATES,
    ZOOM_STEP,
    TRANSPARENT,
    PREFERENCES_FIELDS,
    MINIMAP_WIDTH,
    MINIMAP_HEIGHT,
    MINIMAP_POSITION,
} from "../constants.js";
import {saveAsJson, loadFromJson} from "../json.js";
import {blobToDataUrl} from "../utils/blob.js";
import {useHandlers} from "../hooks/use-handlers.js";
import {useBounds} from "../hooks/use-bounds.js";
import {useCursor} from "../hooks/use-cursor.js";
import {useEditor} from "../hooks/use-editor.js";
import {useDimensions} from "../hooks/use-dimensions.js";
import {Island} from "./island.jsx";
import {Canvas} from "./canvas.jsx";
import {Pointer} from "./pointer.jsx";
import {ContextMenu} from "./context-menu.jsx";
import {Menu} from "./menu.jsx";
import {Title} from "./title.jsx";
import {Hint} from "./hint.jsx";
import {Screenshot} from "./screenshot.jsx";
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
import {SceneProvider, useScene} from "../contexts/scene.jsx";
import {LibraryProvider, useLibrary} from "../contexts/library.jsx";
import {useConfirm} from "../contexts/confirm.jsx";
import {ThemeProvider, themed} from "../contexts/theme.jsx";
import {PreferencesProvider, usePreferences} from "../contexts/preferences.jsx";
import {exportToFile, exportToClipboard} from "../export.js";
import {convertRegionToSceneCoordinates} from "../scene.js";
import {loadLibraryFromJson, saveLibraryAsJson} from "../library.js";

// @description export modes
const EXPORT_MODES = {
    FILE: "export-to-file",
    CLIPBOARD: "export-to-clipboard",
};

// @private
const EditorWithScene = props => {
    const scene = useScene();
    const library = useLibrary();
    const editor = useEditor(props);
    const [preferences, setPreferences] = usePreferences();
    const {showConfirm} = useConfirm();
    const cursor = useCursor(editor.state);
    const bounds = useBounds(editor.state);
    const handlers = useHandlers(editor.state);
    const dimensions = useDimensions(editor.state);

    const selectedElements = scene.getSelection();
    const isScreenshot = editor.state.action === ACTIONS.SCREENSHOT;

    // Handle loading a new drawing
    // We will check first if the onLoad function has been provided as props. If yes,
    // we will call this function instead of loading a canvas from file
    const handleLoad = React.useCallback(() => {
        if (typeof props.onLoad === "function") {
            return props.onLoad();
        }
        const loadDrawing = () => {
            return loadFromJson()
                .then(data => {
                    scene.fromJSON(data);
                    editor.state.welcomeVisible = false;
                    editor.dispatchChange();
                    editor.update();
                })
                .catch(error => console.error(error));
        };
        // Check if scene is empty
        if (scene.pages.length === 1 && scene.page.elements.length === 0) {
            return loadDrawing();
        }
        // If is not empty, display confirmation
        return showConfirm({
            title: "Load new drawing",
            message: "Changes made in this drawing will be lost. Do you want to continue?",
            callback: () => loadDrawing(),
        });
    },  [props.onLoad]);

    // Handle save canvas to a file
    // If a onSave function has been provided as prop, we will execute it instead of loading a
    // canvas from file
    const handleSave = React.useCallback(() => {
        if (typeof props.onSave === "function") {
            return props.onSave();
        }
        // Default action: save canvas to file
        return saveAsJson(scene.toJSON())
            .then(() => console.log("Folio file saved"))
            .catch(error => console.error(error));
    }, [props.onSave]);

    // Handle clear drawing
    const handleClear = React.useCallback(() => {
        return showConfirm({
            title: "Delete all data",
            message: "This will delete all the information of this board, including all pages and drawings. Do you want to continue?",
            confirmText: "Yes, delete all data",
            callback: () => {
                scene.reset();
                editor.dispatchChange();
                editor.update();
            },
        });
    }, []);

    // Handle image load
    const handleImageLoad = React.useCallback(() => {
        const options = {
            description: "Folio Board",
            extensions: [
                FILE_EXTENSIONS.PNG,
                FILE_EXTENSIONS.JPG,
            ],
            multiple: false,
        };
        fileOpen(options)
            .then(blob => blobToDataUrl(blob))
            .then(data => scene.addImageElement(data))
            .then(() => {
                editor.dispatchChange();
                editor.update();
            })
            .catch(error => console.error(error));
    }, []);

    // Handle tool or action change
    const handleToolOrActionChange = React.useCallback((newTool, newAction) => {
        editor.state.tool = newTool;
        editor.state.action = newAction;
        editor.state.contextMenu = false;
        scene.getElements().forEach(element => {
            element.selected = false;
            element.editing = false;
        });
        editor.update();
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

    // Effect to disable the visibility of the welcome elements
    React.useEffect(() => {
        if (editor.state.hintsVisible && scene?.page?.elements?.length > 0) {
            editor.state.hintsVisible = false;
            editor.update();
        }
    }, [scene?.page?.elements?.length]);

    // Hook to reset the action and tool when we change the active page
    React.useEffect(() => {
        if (scene.page.readonly) {
            handleToolOrActionChange(null, ACTIONS.MOVE);
        }
    }, [scene.page.id, scene.page.readonly]);

    return (
        <div className={themed("relative overflow-hidden h-full w-full select-none", "editor")}>
            <Canvas
                id={scene.id}
                elements={scene.page.elements}
                assets={scene.assets}
                backgroundColor={scene.background}
                cursor={cursor}
                translateX={scene.page.translateX}
                translateY={scene.page.translateY}
                zoom={scene.page.zoom}
                snaps={editor.state.visibleSnapEdges}
                bounds={bounds}
                showBounds={!!bounds}
                handlers={handlers}
                brush={editor.state.selection}
                dimensions={dimensions}
                showBrush={editor.state.action === ACTIONS.SELECT || editor.state.action === ACTIONS.SCREENSHOT}
                showPointer={editor.state.action === ACTIONS.ERASE}
                showGrid={scene.appState.grid}
                showSnaps={scene.appState.snapToElements}
                showObjectDimensions={scene.appState.objectDimensions}
                {...editor.events}
            />
            {editor.state.action === ACTIONS.POINTER && (
                <Pointer />
            )}
            {editor.state.contextMenu &&  (
                <ContextMenu
                    top={editor.state.contextMenuTop}
                    left={editor.state.contextMenuLeft}
                    onDuplicate={() => {
                        scene.duplicateElements(scene.getSelection());
                        editor.state.contextMenu = false;
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onLock={() => {
                        scene.lockElements(scene.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onUnlock={() => {
                        scene.unlockElements(scene.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onGroup={() => {
                        scene.groupElements(scene.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onUngroup={() => {
                        scene.ungroupElements(scene.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onCut={() => {
                        const elements = scene.getSelection();
                        scene.cutElementsToClipboard(elements).then(() => {
                            editor.state.contextMenu = false;
                            editor.dispatchChange();
                            editor.update();
                        });
                    }}
                    onCopy={() => {
                        const elements = scene.getSelection();
                        scene.copyElementsToClipboard(elements).then(() => {
                            editor.state.contextMenu = false;
                            editor.dispatchChange();
                            editor.update();
                        });
                    }}
                    onPaste={() => {
                        const x = editor.state.contextMenuLeft;
                        const y = editor.state.contextMenuTop;
                        scene.pasteElementsFromClipboard(null, {x, y}).then(() => {
                            editor.state.contextMenu = false;
                            editor.dispatchChange();
                            editor.update();
                        });
                    }}
                    onSendBackward={() => {
                        scene.sendElementsBackward(scene.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onBringForward={() => {
                        scene.bringElementsForward(scene.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onSelectAll={() => {
                        scene.getElements().forEach(el => el.selected = true);
                        editor.state.contextMenu = false;
                        editor.update();
                    }}
                    onDelete={() => {
                        scene.removeElements(scene.getSelection());
                        editor.state.contextMenu = false;
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onAddToLibrary={() => {
                        editor.state.libraryAddVisible = true;
                        editor.state.contextMenu = false;
                        editor.update();
                    }}
                />
            )}
            {!isScreenshot && (
                <div className="absolute z-20 left-half bottom-0 mb-4" style={{transform:"translateX(-50%)"}}>
                    <ToolsPanel
                        action={editor.state.action}
                        tool={editor.state.tool}
                        toolLocked={editor.state.toolLocked}
                        readonly={!!scene.page.readonly}
                        showSelect={true}
                        showTools={true}
                        showLock={true}
                        onMoveClick={() => {
                            handleToolOrActionChange(null, ACTIONS.MOVE);
                        }}
                        onEraseClick={() => {
                            handleToolOrActionChange(null, ACTIONS.ERASE);
                        }}
                        onPointerClick={() => {
                            handleToolOrActionChange(null, ACTIONS.POINTER);
                        }}
                        onSelectionClick={() => {
                            handleToolOrActionChange(null, ACTIONS.SELECT);
                        }}
                        onToolClick={tool => {
                            // Special action if the image tool is activated
                            if (tool === ELEMENTS.IMAGE) {
                                return handleImageLoad();
                            }
                            handleToolOrActionChange(tool, null);
                        }}
                        onToolLockClick={() => {
                            editor.state.toolLocked = !editor.state.toolLocked;
                            editor.update();
                        }}
                    />
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
            {!scene.page.readonly && editor.state.currentState === STATES.IDLE && !editor.state.layersVisible && !editor.state.libraryVisible && selectedElements.length > 0 && (
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
            {!scene.page.readonly && editor.state.layersVisible && !isScreenshot && (
                <div className="absolute z-30 top-0 mt-16 right-0 pt-1 pr-4">
                    <LayersPanel
                        key={`layers:${scene.id || ""}:${scene.page.id || ""}`}
                        onElementSelect={element => {
                            if (!editor.state.action || editor.state.action === ACTIONS.SELECT) {
                                if (element?.group) {
                                    scene.page.activeGroup = element.group;
                                }
                                scene.selectElements([element]);
                                editor.update();
                            }
                        }}
                        onElementDuplicate={element => {
                            scene.duplicateElements([element]);
                            editor.dispatchChange();
                            editor.update();
                        }}
                        onElementDelete={element => {
                            scene.removeElements([element]);
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
            {!scene.page.readonly && editor.state.libraryVisible && !isScreenshot && (
                <div className="absolute z-30 top-0 mt-16 right-0 pt-1 pr-4">
                    <LibraryPanel
                        key={`library:${scene.id || ""}`}
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
                            scene.addLibraryItem(item, tx, ty);
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
                        key={`pages:${scene.id || ""}:${scene.pages.length}`}
                        editable={true}
                        onChangeActivePage={page => {
                            scene.setActivePage(page);
                            editor.update();
                        }}
                        onPageCreate={() => {
                            scene.addPage({});
                            editor.dispatchChange();
                            editor.update();
                        }}
                        onPageConfigure={page => {
                            editor.state.selectedPage = page;
                            editor.state.pageConfigureVisible = true;
                            editor.update();
                        }}
                        onPageDuplicate={page => {
                            scene.duplicatePage(page);
                            editor.dispatchChange();
                            editor.update();
                        }}
                        onPageDelete={page => {
                            return showConfirm({
                                title: "Delete page",
                                message: `Do you want to delete '${page.title}'? This action can not be undone.`,
                                callback: () => {
                                    scene.removePage(page);
                                    editor.dispatchChange();
                                    editor.update();
                                },
                            });
                        }}
                        onPageMove={(page, nextIndex) => {
                            scene.movePage(page, nextIndex);
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
                                <Menu
                                    links={props.links}
                                    showLoad={props.showLoad}
                                    showSave={props.showSave}
                                    showClear={props.showClear}
                                    showExport={props.showExport}
                                    onSave={handleSave}
                                    onLoad={handleLoad}
                                    onClear={handleClear}
                                    onExport={() => {
                                        editor.state.exportVisible = true;
                                        editor.update();
                                    }}
                                    onPreferences={() => {
                                        editor.state.preferencesVisible = true;
                                        editor.update();
                                    }}
                                />
                                <Island.Separator />
                                {props.showTitle && (
                                    <Title
                                        key={scene.title}
                                        editable={true}
                                        onChange={newTitle => {
                                            // Prevent dispatching a new update if the new title is the same as the prev title
                                            if (newTitle !== scene.title) {
                                                scene.title = newTitle;
                                                editor.dispatchChange();
                                            }
                                        }}
                                    />
                                )}
                                {props.showTitle && <Island.Separator />}
                                <Island.Button
                                    icon="files"
                                    text={(
                                        <div className="w-32 truncate">
                                            <span>{scene.getActivePage().title}</span>
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
                                    disabled={scene.page.readonly || scene.getElements().length === 0}
                                    onClick={() => {
                                        return showConfirm({
                                            title: "Clear Page",
                                            message: "This will remove all elements of this page. Do you want to continue?",
                                            confirmText: "Yes, clear page",
                                            callback: () => {
                                                scene.clearPage(scene.page.id);
                                                editor.dispatchChange();
                                                editor.update();
                                            },
                                        });
                                    }}
                                />
                                {props.showScreenshot && (
                                    <Island.Button
                                        icon="camera"
                                        disabled={scene.getElements().length === 0}
                                        onClick={() => {
                                            handleToolOrActionChange(null, ACTIONS.SCREENSHOT);
                                        }}
                                    />
                                )}
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
                    <div className="absolute top-0 right-0 pt-4 pr-4 z-20 flex gap-2">
                        <div className="flex relative">
                            <HistoryPanel
                                undoDisabled={scene.page.readonly || !scene.canUndo()}
                                redoDisabled={scene.page.readonly || !scene.canRedo()}
                                onUndoClick={() => {
                                    scene.undo();
                                    editor.dispatchChange();
                                    editor.update();
                                }}
                                onRedoClick={() => {
                                    scene.redo();
                                    editor.dispatchChange();
                                    editor.update();
                                }}
                            />
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
                            <ZoomPanel
                                zoom={scene.getZoom()}
                                onZoomInClick={() => {
                                    scene.setZoom(scene.page.zoom + ZOOM_STEP);
                                    editor.update();
                                }}
                                onZoomOutClick={() => {
                                    scene.setZoom(scene.page.zoom - ZOOM_STEP);
                                    editor.update();
                                }}
                            />
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
                                    active={!scene.page.readonly && !editor.state.layersVisible && !editor.state.libraryVisible}
                                    disabled={scene.page.readonly}
                                    onClick={() => {
                                        editor.state.layersVisible = false;
                                        editor.state.libraryVisible = false;
                                        editor.update();
                                    }}
                                />
                                <Island.Button
                                    icon="stack"
                                    active={!scene.page.readonly && editor.state.layersVisible}
                                    disabled={scene.page.readonly}
                                    onClick={() => {
                                        editor.state.layersVisible = true;
                                        editor.state.libraryVisible = false;
                                        editor.update();
                                    }}
                                />
                                <Island.Button
                                    icon="album"
                                    active={!scene.page.readonly && editor.state.libraryVisible}
                                    disabled={scene.page.readonly}
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
                    {scene.page.readonly && (
                        <div className="absolute top-0 left-half pt-4 z-30 flex gap-2 translate-x-half-n">
                            <div className="rounded-xl shadow-sm border border-yellow-200 bg-yellow-100 text-yellow-900 p-2 flex gap-2 items-center">
                                <div className="flex items-center p-0">
                                    <LockIcon />
                                </div>
                                <div className="text-sm">Page is on Read-Only mode.</div>
                            </div>
                        </div>
                    )}
                </React.Fragment>
            )}
            {editor.state.action === ACTIONS.SCREENSHOT && (
                <Screenshot
                    onDownload={(region, options) => {
                        handleExport(EXPORT_MODES.FILE, scene.getElements(), {
                            background: options?.background ? scene.background : TRANSPARENT,
                            crop: convertRegionToSceneCoordinates(scene, region),
                        });
                        editor.state.action = null;
                        editor.update();
                    }}
                    onCopyToClipboard={(region, options) => {
                        handleExport(EXPORT_MODES.CLIPBOARD, scene.getElements(), {
                            background: options?.background ? scene.background : TRANSPARENT,
                            crop: convertRegionToSceneCoordinates(scene, region),
                        });
                        editor.state.action = null;
                        editor.update();
                    }}
                    onCancel={() => {
                        editor.state.action = null;
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
                        if (scene.page.id === editor.state.selectedPage.id) {
                            editor.state.tool = null;
                            editor.state.contextMenu = false;
                            if (editor.state.action !== ACTIONS.MOVE && editor.state.action !== ACTIONS.POINTER) {
                                editor.state.action = ACTIONS.MOVE;
                            }
                            // Reset selected elements and editing state
                            scene.getElements().forEach(element => {
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
                    <SceneProvider initialData={initialData}>
                        <EditorWithScene {...props} />
                    </SceneProvider>
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
