import React from "react";
import classNames from "classnames";
import {CloseIcon} from "@josemi-icons/react";
import {useEditor} from "../../contexts/editor.jsx";
import {exportToDataURL} from "../../lib/export.js";
import {FIELDS, TOOLS, TRANSPARENT} from "../../constants.js";

// Layers preview variables
const LAYER_PREVIEW_SIZE = 64;
const LAYER_PREVIEW_BACKGROUND = TRANSPARENT;

// Tiny hook to generate the preview of the element
const useElementPreview = (elements, dependencies = []) => {
    const editor = useEditor();
    const [previewImage, setPreviewImage] = React.useState(null);
    React.useEffect(() => {
        if (elements.length > 1 || !elements[0]?.[FIELDS.CREATING]) {
            const previewOptions = {
                assets: editor.assets,
                width: LAYER_PREVIEW_SIZE,
                height: LAYER_PREVIEW_SIZE,
                background: LAYER_PREVIEW_BACKGROUND,
            };
            exportToDataURL(elements, previewOptions).then(image => {
                return setPreviewImage(image);
            });
        }
    }, dependencies);
    return previewImage;
};

const LayerItem = ({elements, active = false, onClick, onDoubleClick}) => {
    const previewImage = useElementPreview(elements, elements.map(el => el.version));
    const layerClass = classNames({
        "relative shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-white border-2 p-2": true,
        "border-neutral-950": active,
        "hover:bg-neutral-200 border-neutral-200 cursor-pointer": !active,
    });
    return (
        <div className={layerClass} onClick={onClick} onDoubleClick={onDoubleClick}>
            {previewImage && (
                <img src={previewImage} width="100%" height="100%" />
            )}
            {elements.length > 1 && (
                <div className="absolute bottom-0 right-0 bg-neutral-950 flex items-center justify-center h-4 w-4 rounded-full mb-1 mr-1">
                    <span className="text-white text-2xs leading-none font-bold">{elements.length}</span>
                </div>
            )}
        </div>
    );
};

export const LayersPanel = ({maxHeight = "100vh - 5rem"}) => {
    // const [activeGroup, setActiveGroup] = React.useState("");
    const editor = useEditor();
    const activeGroup = editor.page.activeGroup || "";

    // generate a key to force the update of the groups map
    const key = editor.page.elements.map(el => el.id + "." + (el.group || ".")).join("-");

    // generate a map of groups in the board
    // each group contains the list of elements on it, the index of the group
    // and the last element of the group (to display the group item in the layers panel)
    const groups = React.useMemo(() => {
        const groupsMap = new Map();
        let currentGroupIndex = 1;
        editor.page.elements.forEach(element => {
            if (element.group) {
                if (!groupsMap.has(element.group)) {
                    groupsMap.set(element.group, {
                        elements: [],
                        index: currentGroupIndex,
                        lastElement: null,
                    });
                    currentGroupIndex = currentGroupIndex + 1;
                }
                groupsMap.get(element.group).elements.push(element);
                groupsMap.get(element.group).lastElement = element.id;
            }
        });
        return groupsMap;
    }, [key]);

    // get the elements to be displayed in the layers panel
    const visibleElements = React.useMemo(() => {
        // 1. activeGroup is not empty, return the elements on this group
        if (activeGroup) {
            return editor.page.elements.filter(element => element.group === activeGroup);
        }
        // 2. activeGroup is empty, return all the elements
        return editor.page.elements;
    }, [editor, key, activeGroup]);

    // exit the current active group
    const handleCloseActiveGroup = React.useCallback(() => {
        editor.setTool(TOOLS.SELECT);
        editor.page.activeGroup = "";
        editor.update();
    }, [editor]);

    // handle click on a layer item
    const handleClick = React.useCallback(elements => {
        if (!editor.page.readonly) {
            editor.setTool(TOOLS.SELECT);
            editor.setSelection(elements.map(el => el.id));
            editor.update();
        }
    }, [editor, editor.page, editor.page.readonly]);

    // handle double click on a group item
    const handleDoubleClick = React.useCallback(groupId => {
        if (!editor.page.readonly) {
            editor.setTool(TOOLS.SELECT);
            editor.page.activeGroup = groupId;
            editor.update();
        }
    }, [editor, editor.page, editor.page.readonly]);

    // calculate the container style
    const containerStyle = React.useMemo(() => {
        return {
            maxHeight: `calc(${maxHeight} - ${activeGroup ? "3rem" : "0rem"})`,
            scrollbarWidth: "none",
        };
    }, [activeGroup, maxHeight]);

    return (
        <React.Fragment>
            <div className="flex flex-col-reverse gap-2 overflow-y-auto" style={containerStyle}>
                {visibleElements.map(element => (
                    <React.Fragment key={element.id + "." + (element.group || "")}>
                        {(!element.group || activeGroup) && (
                            <LayerItem
                                key={element.id}
                                elements={[element]}
                                active={element.selected}
                                onClick={() => handleClick([element])}
                            />
                        )}
                        {!activeGroup && element.group && groups.get(element.group).lastElement === element.id && (
                            <LayerItem
                                key={element.group}
                                elements={groups.get(element.group).elements}
                                active={groups.get(element.group).elements.some(el => el.selected)}
                                onClick={() => handleClick(groups.get(element.group).elements)}
                                onDoubleClick={() => handleDoubleClick(element.group)}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
            {activeGroup && (
                <div className="flex items-center justify-center mt-2">
                    <div className="cursor-pointer flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm border border-neutral-200" onClick={handleCloseActiveGroup}>
                        <CloseIcon />
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};
