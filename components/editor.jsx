import React from "react";
import {fileOpen} from "browser-fs-access";
import {BarsIcon, CameraIcon, FilesIcon, PresentationIcon} from "@josemi-icons/react";
import {
    ACTIONS,
    ELEMENTS,
    FILE_EXTENSIONS,
    SELECT_BOUNDS_FILL_COLOR,
    SELECT_BOUNDS_STROKE_COLOR,
    SELECTION_FILL_COLOR,
    SELECTION_STROKE_COLOR,
    STATES,
    ZOOM_STEP,
} from "../lib/constants.js";
import {saveAsJson, loadFromJson} from "../lib/json.js";
import {blobToDataUrl} from "../lib/utils/blob.js";
import {useHandlers} from "../hooks/use-handlers.js";
import {useBounds} from "../hooks/use-bounds.js";
import {useCursor} from "../hooks/use-cursor.js";
import {useEditor} from "../hooks/use-editor.js";
import {HeaderContainer, HeaderButton} from "./commons/header.jsx";
import {Canvas} from "./canvas.jsx";
import {Pointer} from "./pointer.jsx";
import {ContextMenu} from "./ui/context-menu.jsx";
import {Menu} from "./ui/menu.jsx";
import {Title} from "./ui/title.jsx";
import {Hint} from "./ui/hint.jsx";
import {ExportDialog} from "./dialogs/export.jsx";
import {WelcomeDialog} from "./dialogs/welcome.jsx";
import {ToolsPanel} from "./panels/tools.jsx";
import {EditionPanel} from "./panels/edition.jsx";
import {ZoomPanel} from "./panels/zoom.jsx";
import {HistoryPanel} from "./panels/history.jsx";
import {PagesPanel} from "./panels/pages.jsx";
import {useConfirm} from "../contexts/confirm.jsx";
import {SceneProvider, useScene} from "../contexts/scene.jsx";

// @private
const EditorWithScene = props => {
    const scene = useScene();
    const editor = useEditor(props);
    const {showConfirm} = useConfirm();
    const cursor = useCursor(editor.state);
    const bounds = useBounds(editor.state);
    const handlers = useHandlers(editor.state);

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
            title: "Clear drawing",
            message: "This will clear the whole drawing, including pages. Do you want to continue?",
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

    // Effect to disable the visibility of the welcome elements
    React.useEffect(() => {
        if (editor.state.hintsVisible && scene?.page?.elements?.length > 0) {
            editor.state.hintsVisible = false;
            editor.update();
        }
    }, [scene?.page?.elements?.length]);

    return (
        <div className="relative overflow-hidden h-full w-full select-none">
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
                boundsFillColor={SELECT_BOUNDS_FILL_COLOR}
                boundsStrokeColor={SELECT_BOUNDS_STROKE_COLOR}
                showBounds={!!bounds}
                handlers={handlers}
                brush={editor.state.selection}
                brushFillColor={SELECTION_FILL_COLOR}
                brushStrokeColor={SELECTION_STROKE_COLOR}
                showBrush={editor.state.action === ACTIONS.SELECT || editor.state.action === ACTIONS.SCREENSHOT}
                showPointer={editor.state.action === ACTIONS.ERASE}
                showGrid={scene.appState.grid}
                showSnaps={scene.appState.snapToElements}
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
                        editor.update();
                    }}
                    onDelete={() => {
                        scene.removeElements(scene.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                />
            )}
            {!isScreenshot && (
                <div className="absolute z-5 left-half bottom-0 mb-4" style={{transform:"translateX(-50%)"}}>
                    <ToolsPanel
                        action={editor.state.action}
                        tool={editor.state.tool}
                        toolLocked={editor.state.toolLocked}
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
            {editor.state.currentState === STATES.IDLE && selectedElements.length > 0 && (
                <React.Fragment>
                    {(selectedElements.length > 1 || !selectedElements[0].editing) && (
                        <div className="absolute z-6 top-0 mt-16 right-0 pt-1 pr-4">
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
            {editor.state.pagesVisible && !isScreenshot && (
                <div className="absolute z-6 top-0 mt-16 left-0 pt-1 pl-4">
                    <PagesPanel
                        key={`pages:${scene.pages.length}`}
                        editable={true}
                        onChangeActivePage={page => {
                            scene.setActivePage(page);
                            editor.update();
                        }}
                        onPageCreate={() => {
                            scene.addPage();
                            editor.dispatchChange();
                            editor.update();
                        }}
                        onPageEdit={() => {
                            editor.dispatchChange();
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
                    <div className="absolute top-0 left-0 pt-4 pl-4 z-7 flex gap-2">
                        <div className="relative flex">
                            <HeaderContainer>
                                <Menu
                                    links={props.links}
                                    showLoad={props.showLoad}
                                    showSave={props.showSave}
                                    showClear={props.showClear}
                                    showChangeBackground={props.showChangeBackground}
                                    showExport={props.showExport}
                                    onSave={handleSave}
                                    onLoad={handleLoad}
                                    onClear={handleClear}
                                    onExport={() => {
                                        editor.state.exportVisible = true;
                                        editor.update();
                                    }}
                                    onBackgroundChange={newBackground => {
                                        scene.background = newBackground;
                                        editor.dispatchChange();
                                        editor.update();
                                    }}
                                    onGridChange={() => {
                                        scene.appState.grid = !scene.appState.grid;
                                        editor.dispatchChange();
                                        editor.update();
                                    }}
                                    onSnapToElementsChange={() => {
                                        scene.appState.snapToElements = !scene.appState.snapToElements;
                                        editor.dispatchChange();
                                        editor.update();
                                    }}
                                />
                                <div className="w-px bg-neutral-200" />
                                {props.showTitle && false && (
                                    <Title
                                        title={scene.title}
                                        editable={true}
                                        onChange={newTitle => {
                                            scene.title = newTitle;
                                            editor.dispatchChange();
                                        }}
                                    />
                                )}
                                <HeaderButton
                                    icon="files"
                                    text={(
                                        <div className="w-32 truncate">
                                            <span>{scene.getActivePage().title}</span>
                                        </div>
                                    )}
                                    showChevron={true}
                                    active={editor.state.pagesVisible}
                                    onClick={() => {
                                        editor.state.pagesVisible = !editor.state.pagesVisible;
                                        editor.state.contextMenu = false;
                                        editor.update();
                                    }}
                                />
                                {props.showScreenshot && (
                                    <HeaderButton
                                        icon="camera"
                                        disabled={scene.getElements().length === 0}
                                        onClick={() => {
                                            handleToolOrActionChange(null, ACTIONS.SCREENSHOT);
                                        }}
                                    />
                                )}
                            </HeaderContainer>
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
                    <div className="absolute top-0 right-0 pt-4 pr-4 z-7 flex gap-2">
                        <div className="flex relative">
                            <HistoryPanel
                                undoDisabled={!scene.canUndo()}
                                redoDisabled={!scene.canRedo()}
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
                            {(editor.state.hintsVisible && !editor.state.tool) && (
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
                            {(editor.state.hintsVisible && !editor.state.tool) && (
                                <Hint
                                    position="bottom"
                                    title="Zoom"
                                    contentClassName="w-24 text-center"
                                    content="Apply zoom to the board."
                                />
                            )}
                        </div>
                        {props.headerRightContent}
                    </div>
                </React.Fragment>
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
                    crop={editor.state.exportRegion}
                    onClose={() => {
                        editor.state.exportVisible = false;
                        editor.state.exportRegion = null;
                        editor.update();
                    }}
                />
            )}
        </div>
    );
};

// @description Public editor
export const Editor = ({initialData, ...props}) => {
    return (
        <SceneProvider initialData={initialData}>
            <EditorWithScene {...props} />
        </SceneProvider>
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
};
