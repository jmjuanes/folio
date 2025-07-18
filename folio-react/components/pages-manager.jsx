import React from "react";
import {useUpdate} from "react-use";
import classNames from "classnames";
import { DotsVerticalIcon, CheckIcon } from "@josemi-icons/react";
import { Island } from "./island.jsx";
import { Dropdown } from "./ui/dropdown.jsx";
import { useEditor } from "../contexts/editor.jsx";
import { usePagePreview } from "../hooks/use-page-preview.js";
import { clearFocus } from "../utils/dom.js";

const PREVIEW_WIDTH = 280;
const PREVIEW_HEIGHT = 160;

// @private container style
const containerStyle = {
    touchAction: "none",
    userSelect: "none",
    WebkitTouchCallout: "none",
};

const Checkbox = ({checked, disabled, onClick}) => {
    const checkboxClass = classNames({
        "flex items-center w-5 h-5 rounded-md border-2 border-gray-950 text-lg": true,
        "bg-white": !checked,
        "bg-gray-950 text-white": checked,
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
    const previewClass = classNames({
        "relative group shrink-0 rounded-md overflow-hidden cursor-pointer shadow-sm": true,
        "border-1 border-gray-200": !props.selected,
        "border-4 border-gray-950": props.selected,
    });
    const checkboxContainerClass = classNames({
        "absolute top-0 right-0 mt-2 mr-2 z-40": true,
        "hidden group-hover:block": !props.selected,
    });
    const previewStyle = {
        width: PREVIEW_WIDTH + "px",
        height: PREVIEW_HEIGHT + "px",
    };
    return (
        <div className="p-1">
            <div className="flex items-center justify-between mb-2 h-6">
                <div className="text-xs text-gray-900 font-bold truncate w-40">
                    {page.title}
                </div>
                {props.showDropdown && (
                    <div className="flex relative group" tabIndex="0">
                        <div className="flex items-center p-1 group-hover:bg-gray-200 group-focus-within:bg-gray-200 rounded-md cursor-pointer">
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
                )}
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
        <div className="absolute pointer-events-none border-4 border-gray-950 rounded" style={previewStyle}>
            <img src={previewImage} width={PREVIEW_WIDTH / 2} height={PREVIEW_HEIGHT / 2} />
        </div>
    );
};

// @private page separator
const PageSeparator = ({className, active = false, visible = false, onPointerEnter, onPointerLeave}) => {
    const separatorClass = classNames(className, {
        "flex items-center w-4 h-48": true,
        "opacity-0 pointer-events-none": !visible,
    });
    return (
        <div className={separatorClass} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
            <div
                className={classNames({
                    "w-1": true,
                    "h-20 bg-gray-200": !active,
                    "h-40 bg-gray-900": active,
                })}
            />
        </div>
    );
};

export const PagesManager = props => {
    const editor = useEditor();
    const forceUpdate = useUpdate();
    const draggedIndex = React.useRef(null);
    const dropIndex = React.useRef(null);
    const [editEnabled, setEditEnabled] = React.useState(false);
    const [cursorPosition, setCursorPosition] = React.useState(null);
    const selectedPages = React.useMemo(() => new Set(), [editor.pages.length, editEnabled]);

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

        // check if we are in edit mode
        if (editEnabled) {
            const id = editor.pages[index].id;
            // check if we have clicked the shift key to select multiple pages
            if (event.shiftKey) {
                selectedPages.has(id) ? selectedPages.delete(id) : selectedPages.add(id);
            }
            else {
                selectedPages.clear(); // clear the selection
                selectedPages.add(id);
            }
            return forceUpdate();
        }

        // dragging is only enabled if we have more than one page and we have not selected multiple pages
        if (editor.pages.length > 1) {
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
                    props.onChangeActivePage(editor.pages[index]);
                }
                // check if the page has been dragged and dropped
                else if (dropIndex.current !== null) {
                    props.onPageMove(editor.pages[index], dropIndex.current);
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

    return (
        <div className="absolute top-0 left-0 w-full h-full z-50 bg-gray-100" style={containerStyle}>
            <div className="absolute left-0 top-0 mt-4 ml-4 z-50 flex gap-2">
                <Island>
                    <Island.Button
                        icon="book-open"
                        disabled={true}
                    />
                    <Island.Button
                        icon="grid"
                        disabled={false}
                        active={true}
                    />
                </Island>
            </div>
            <div className="absolute right-0 top-0 mt-4 mr-4 z-50">
                <Island>
                    <Island.Button icon="x" onClick={props.onCancel} />
                </Island>
            </div>
            <div className="absolute left-half bottom-0 mb-4 translate-x-half-n z-50 flex flex-col gap-2 justify-center">
                {!editEnabled && (
                    <div className="flex gap-2">
                        <Island>
                            <Island.Button
                                icon="grid-plus"
                                onClick={() => setEditEnabled(true)}
                            />
                        </Island>
                        <Island>
                            <Island.Button
                                icon="plus"
                                text="New Page"
                                onClick={() => props.onPageCreate(editor.pages.length)}
                            />
                        </Island>
                    </div>
                )}
                {editEnabled && (
                    <React.Fragment>
                        <div className="text-xs font-medium opacity-60 text-center">
                            <span>{selectedPages.size === 0 ? "Touch a page to select it" : `${selectedPages.size} pages selected`}</span>
                        </div>
                        <div className="flex gap-2">
                            <Island>
                                <Island.Button
                                    icon="copy"
                                    text="Duplicate"
                                    disabled={selectedPages.size === 0}
                                    onClick={() => {
                                        props.onPageDuplicate(editor.pages.filter(page => selectedPages.has(page.id)));
                                    }}
                                />
                                <Island.Button
                                    icon="trash"
                                    text="Delete"
                                    disabled={selectedPages.size === 0 || editor.pages.length === selectedPages.size}
                                    onClick={() => {
                                        props.onPageDelete(editor.pages.filter(page => selectedPages.has(page.id)));
                                    }}
                                />
                            </Island>
                            <Island>
                                <Island.Button
                                    icon="x"
                                    text="Cancel"
                                    onClick={() => setEditEnabled(false)}
                                />
                            </Island>
                        </div>
                    </React.Fragment>
                )}
            </div>
            <div className="flex flex-wrap justify-center px-4 pt-20 pb-12">
                {editor.pages.map((page, index) => (
                    <div className="flex items-center flex-no-wrap" key={page.id}>
                        <PageSeparator
                            className="justify-start"
                            active={dropIndex.current === index}
                            visible={draggedIndex.current !== null}
                            onPointerEnter={() => setDropIndex(index)}
                            onPointerLeave={() => setDropIndex(null)}
                        />
                        <PageItem
                            key={page.id}
                            page={page}
                            dragging={draggedIndex.current === index}
                            selected={draggedIndex.current !== null ? draggedIndex.current === index : (editEnabled ? selectedPages.has(page.id) : editor.page.id === page.id)}
                            showDropdown={!editEnabled}
                            showCheckbox={false}
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
                        <PageSeparator
                            className="justify-end"
                            active={dropIndex.current === index + 1}
                            visible={draggedIndex.current !== null}
                            onPointerEnter={() => setDropIndex(index + 1)}
                            onPointerLeave={() => setDropIndex(null)}
                        />
                    </div>
                ))}
            </div>
            {draggedIndex.current !== null && !!cursorPosition && (
                <PageDraggingPreview
                    page={editor.pages[draggedIndex.current]}
                    x={cursorPosition.x}
                    y={cursorPosition.y}
                />
            )}
        </div>
    );
};
