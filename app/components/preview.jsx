import React from "react";
import {useUpdate} from "react-use";
import classNames from "classnames";
import {
    DotsVerticalIcon,
    TrashIcon,
    CheckIcon,
    PencilIcon,
    CopyIcon,
    BarsIcon,
    PlusIcon,
    LockIcon,
} from "@josemi-icons/react";
import {Island} from "./island.jsx";
import {Dropdown} from "./ui/dropdown.jsx";
import {useScene} from "../contexts/scene.jsx";
import {themed} from "../contexts/theme.jsx";
import {usePagePreview} from "../hooks/use-page-preview.js";
import {clearFocus} from "../utils/dom.js";

const PREVIEW_WIDTH = 280;
const PREVIEW_HEIGHT = 160;

// @private container style
const containerStyle = {
    touchAction: "none",
    userSelect: "none",
    WebkitTouchCallout: "none",
};

const Checkbox = ({checked, disabled, onClick}) => {
    const checkboxClass = themed({
        "flex items-center w-5 h-5 rounded-md border-2 border-neutral-950 text-lg": true,
        "bg-white": !checked,
        "bg-neutral-950 text-white": checked,
        "opacity-60 pointer-events-none": disabled,
    });
    return (
        <div className={checkboxClass} onClick={onClick}>
            {checked && <CheckIcon />}
        </div>
    );
};

// @private page in gallery mode
const PageItem = ({page, dragging, onDragStart, onDelete, onDuplicate, ...props}) => {
    const previewImage = usePagePreview(page, PREVIEW_WIDTH, PREVIEW_HEIGHT);
    const previewClass = themed({
        "relative group shrink-0 rounded-md overflow-hidden cursor-pointer shadow-sm": true,
        "border border-neutral-200": !props.selected,
        "border-4 border-neutral-950": props.selected,
    });
    const checkboxContainerClass = themed({
        "absolute top-0 right-0 mt-2 mr-2 z-40": true,
        "hidden group-hover:block": !props.selected,
    });
    const previewStyle = {
        width: PREVIEW_WIDTH + "px",
        height: PREVIEW_HEIGHT + "px",
    };
    return (
        <div className="p-1">
            <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-neutral-900 font-bold truncate w-40">
                    {page.title}
                </div>
                <div className="flex relative group" tabIndex="0">
                    <div className="flex items-center p-1 group-hover:bg-neutral-200 group-focus-within:bg-neutral-200 rounded-md cursor-pointer">
                        <DotsVerticalIcon />
                    </div>
                    <Dropdown className="hidden group-focus-within:block top-full right-0 mt-1 w-32 z-50">
                        <Dropdown.Item disabled={false} onClick={onDelete}>
                            <Dropdown.Icon icon="trash" />
                            <span>Delete</span>
                        </Dropdown.Item>
                        <Dropdown.Item disabled={false} onClick={onDuplicate}>
                            <Dropdown.Icon icon="copy" />
                            <span>Duplicate</span>
                        </Dropdown.Item>
                    </Dropdown>
                </div>
            </div>
            <div className="group relative">
                {props.showCheckbox && (
                    <div className={checkboxContainerClass}>
                        <Checkbox checked={props.selected} disabled={props.selectedDisabled} onClick={props.onSelect} />
                    </div>
                )}
                <div className={previewClass} onPointerDown={onDragStart} style={previewStyle}>
                    {!dragging && (
                        <img src={previewImage} width="100%" height="100%" />
                    )}
                </div>
            </div>
        </div>
    );
};

// @private page dragging preview
const PageDraggingPreview = ({page, x, y}) => {
    const previewImage = usePagePreview(page, PREVIEW_WIDTH / 2, PREVIEW_HEIGHT / 2);
    const previewStyle = {
        top: y + "px",
        left: x + "px",
        opacity: 0.55,
    };
    return (
        <div className="absolute pointer-events-none border-4 border-neutral-950 rounded" style={previewStyle}>
            <img src={previewImage} width={PREVIEW_WIDTH / 2} height={PREVIEW_HEIGHT / 2} />
        </div>
    );
};

// @private page separator
const PageDropSeparator = ({active, onPointerEnter, onPointerLeave}) => (
    <div className="flex items-center justify-center w-16 h-48" onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
        <div
            className={themed({
                "w-1 rounded": true,
                "h-20 bg-neutral-200": !active,
                "h-40 bg-neutral-900": active,
            })}
        />
    </div>
);

// @private page add separator
const PageAddSeparator = ({onClick}) => (
    <div className="group flex items-center justify-center w-16 h-48">
        <div
            className="flex items-center justify-center w-10 h-10 bg-white border border-neutral-200 rounded-full cursor-pointer shadow-sm opacity-20 group-hover:opacity-100"
            onClick={onClick}
        >
            <PlusIcon />
        </div>
    </div>
);

export const Preview = props => {
    const scene = useScene();
    const forceUpdate = useUpdate();
    const draggedIndex = React.useRef(null);
    const dropIndex = React.useRef(null);
    // const [draggedIndex, setDraggedIndex] = React.useState(null);
    // const [dropIndex, setDropIndex] = React.useState(null);
    const [cursorPosition, setCursorPosition] = React.useState(null);
    const selectedPages = React.useMemo(() => new Set([scene.page.id]), [scene.pages.length, scene.page.id]);

    const setDropIndex = React.useCallback(index => {
        // note: we don't allow to drop the page on itself
        if (index === null || (index !== draggedIndex.current && index !== draggedIndex.current + 1)) {
            dropIndex.current = index;
        }
    }, []);

    const handleDragStart = (event, index) => {
        event.preventDefault();
        event.stopPropagation();
        clearFocus();

        // check if we have clicked the shift key to select multiple pages
        if (event.shiftKey) {
            const id = scene.pages[index].id;
            if (scene.page.id !== id) {
                selectedPages.has(id) ? selectedPages.delete(id) : selectedPages.add(id);
            }
            return forceUpdate();
        }

        // dragging is only enabled if we have more than one page and we have not selected multiple pages
        if (scene.pages.length > 1) {
            let hasDragged = false;
            draggedIndex.current = index;
            dropIndex.current = null;
            // handle the pointer move event
            const handlePointerMove = event => {
                hasDragged = true;
                setCursorPosition({x: event.clientX, y: event.clientY});
            };
            // handle the pointer up event
            const handlePointerUp = event => {
                document.removeEventListener("pointermove", handlePointerMove);
                document.removeEventListener("pointerup", handlePointerUp);

                // check if the page does not have been dragged, and in this case we select it
                if (!hasDragged) {
                    props.onChangeActivePage(scene.pages[index]);
                }
                // check if the page has been dragged and dropped
                else if (dropIndex.current !== null) {
                    props.onPageMove(scene.pages[index], dropIndex.current);
                }
                // reset the dragged index and clear the cursor position
                draggedIndex.current = null;
                dropIndex.current = null;
                setCursorPosition(null);
            };
            // register event listeners
            document.addEventListener("pointermove", handlePointerMove);
            document.addEventListener("pointerup", handlePointerUp);
        }
    };

    // check if all pages have been selected
    const allPagesSelected = scene.pages.length === selectedPages.size;

    return (
        <div className="absolute top-0 left-0 w-full h-full z-50 bg-neutral-100" style={containerStyle}>
            <div className="absolute left-0 top-0 mt-4 ml-4 z-50">
                <Island>
                    <div className="flex items-center justify-center px-2 text-sm font-medium opacity-80 w-28">
                        <span>{selectedPages.size} Selected</span>
                    </div>
                    <Island.Button
                        icon="check-square"
                        text="Select All"
                        disabled={allPagesSelected}
                        onClick={() => {
                            scene.pages.forEach(page => selectedPages.add(page.id));
                            forceUpdate();
                        }}
                    />
                    <Island.Button
                        icon="x-square"
                        text="Deselect All"
                        disabled={selectedPages.size === 1}
                        onClick={() => {
                            selectedPages.clear();
                            selectedPages.add(scene.page.id);
                            forceUpdate();
                        }}
                    />
                    <Island.Separator />
                    <Island.Button
                        icon="copy"
                        text="Duplicate"
                        onClick={() => {
                            props.onPageDuplicate(scene.pages.filter(page => selectedPages.has(page.id)));
                        }}
                    />
                    <Island.Button
                        icon="trash"
                        text="Delete"
                        disabled={allPagesSelected}
                        onClick={() => {
                            props.onPageDelete(scene.pages.filter(page => selectedPages.has(page.id)));
                        }}
                    />
                    <Island.Separator />
                    <Island.Button
                        icon="plus-circle"
                        text="Add New"
                        onClick={() => props.onPageCreate(scene.pages.length)}
                    />
                </Island>
            </div>
            <div className="absolute right-0 top-0 mt-4 mr-4 z-50">
                <Island>
                    <Island.Button icon="x" onClick={props.onCancel} />
                </Island>
            </div>
            <div className="flex flex-wrap items-center px-4 pt-20 pb-12">
                {scene.pages.map((page, index) => (
                    <div className="flex items-center flex-no-wrap" key={page.id}>
                        {draggedIndex.current === null && (
                            <PageAddSeparator onClick={() => props.onPageCreate(index)} />
                        )}
                        {draggedIndex.current !== null && (
                            <PageDropSeparator
                                active={dropIndex.current === index}
                                onPointerEnter={() => setDropIndex(index)}
                                onPointerLeave={() => setDropIndex(null)}
                            />
                        )}
                        <PageItem
                            key={page.id}
                            page={page}
                            dragging={draggedIndex.current === index}
                            selected={draggedIndex.current !== null ? draggedIndex.current === index : selectedPages.has(page.id)}
                            selectedDisabled={scene.page.id === page.id}
                            showCheckbox={draggedIndex.current === null && (scene.page.id !== page.id || selectedPages.size > 1)}
                            onDragStart={event => handleDragStart(event, index)}
                            onDuplicate={() => {
                                props.onPageDuplicate(page);
                                clearFocus();
                            }}
                            onDelete={() => props.onPageDelete(page)}
                            onSelect={event => {
                                event.stopPropagation();
                                // note: we don't allow to unselect the active page
                                selectedPages.has(page.id) ? selectedPages.delete(page.id) : selectedPages.add(page.id);
                                forceUpdate();
                            }}
                        />
                    </div>
                ))}
                {draggedIndex.current === null && (
                    <PageAddSeparator onClick={() => props.onPageCreate(scene.pages.length)} />
                )}
                {draggedIndex.current !== null && (
                    <PageDropSeparator
                        active={dropIndex.current === scene.pages.length}
                        onPointerEnter={() => setDropIndex(scene.pages.length)}
                        onPointerLeave={() => setDropIndex(null)}
                    />
                )}
            </div>
            {draggedIndex.current !== null && !!cursorPosition && (
                <PageDraggingPreview
                    page={scene.pages[draggedIndex.current]}
                    x={cursorPosition.x}
                    y={cursorPosition.y}
                />
            )}
        </div>
    );
};
