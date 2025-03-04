import React from "react";
import classNames from "classnames";
import {CloseIcon} from "@josemi-icons/react";
import {useEditor} from "../../contexts/editor.jsx";
import {exportToDataURL} from "../../export.js";
import {FIELDS, TOOLS, TRANSPARENT} from "../../constants.js";
import transparentBg from "../../assets/transparent.svg";

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

const previewStyle = {
    backgroundImage: `url('${transparentBg}')`,
    backgroundSize: "10px 10px",
    backgroundRepeat: "repeat",
};

const LayerItem = ({element, onClick}) => {
    const previewImage = useElementPreview([element], [
        element[FIELDS.CREATING],
        element[FIELDS.EDITING],
        element[FIELDS.VERSION],
    ]);
    return (
        <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-white border-2 border-neutral-200" onClick={onClick}>
            {previewImage && (
                <img src={previewImage} width="100%" height="100%" />
            )}
        </div>
    );
};

const LayerGroupItem = ({elements, onClick}) => {
    const previewImage = useElementPreview(elements, elements.map(el => el.version));
    return (
        <div className="shrink-0 w-14 h-14 rounded-lg bg-white" onClick={onClick}>
            {previewImage && (
                <img src={previewImage} width="100%" height="100%" />
            )}
        </div>
    );
};

export const LayersPanel = () => {
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

    // Automatically expand groups with selected items
    // React.useEffect(() => {
    //     let shouldUpdate = false;
    //     // 1. Check if there is a selected element inside a group
    //     editor.page.elements.forEach(element => {
    //         if (element.group && element.selected && editor.page.activeGroup === element.group) {
    //             expandedGroups.current.add(element.group);
    //             shouldUpdate = true;
    //         }
    //     });
    //     // 2. Trigger an update if we have added at least one group
    //     // in the list of expanded groups
    //     if (expandedGroups.current.size > 0 && shouldUpdate) {
    //         // setEditingLayer("");
    //         update();
    //     }
    // }, [editor.page.activeGroup]);

    return (
        <div className="flex flex-col-reverse gap-2 overflow-y-auto" style={{maxHeight:"calc(75vh - 8rem)"}}>
            {visibleElements.map(element => (
                <React.Fragment key={element.id + "." + (element.group || "")}>
                    {(!element.group || activeGroup) && (
                        <LayerItem
                            key={element.id}
                            element={element}
                            onClick={() => {
                                // TODO
                            }}
                        />
                    )}
                    {!activeGroup && element.group && groups.get(element.group).lastElement === element.id && (
                        <LayerGroupItem
                            key={element.group}
                            elements={groups.get(element.group).elements}
                            onClick={() => {
                                editor.setTool(TOOLS.SELECT);
                                editor.page.activeGroup = element.group;
                                editor.update();
                            }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};
