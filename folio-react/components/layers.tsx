import { useMemo, useCallback, useState, useEffect, Fragment } from "react";
import classNames from "classnames";
import { CloseIcon } from "@josemi-icons/react";
import { useEditor } from "../contexts/editor.tsx";
import { exportToDataURL } from "../lib/export.js";
import { FIELDS, TOOLS, TRANSPARENT } from "../constants.js";
import type { JSX, CSSProperties, PropsWithChildren } from "react";

// Layers preview variables
const LAYER_PREVIEW_SIZE = 64;
const LAYER_PREVIEW_BACKGROUND = TRANSPARENT;

// Tiny hook to generate the preview of the element
const useElementPreview = (elements: any[], dependencies: string[] = []): string | null => {
    const editor = useEditor();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    useEffect(() => {
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

export type LayerItemProps = {
    elements: any[],
    active?: boolean,
    onClick: () => void,
    onDoubleClick?: () => void,
};

export const LayerItem = ({ elements, active = false, onClick, onDoubleClick }: LayerItemProps): JSX.Element => {
    const previewImage = useElementPreview(elements, elements.map(el => el.version));
    const layerClass = classNames({
        "relative shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-white border-2 p-2": true,
        "border-gray-950": active,
        "hover:bg-gray-200 border-gray-200 cursor-pointer": !active,
    });
    return (
        <div className={layerClass} onClick={onClick} onDoubleClick={onDoubleClick}>
            {previewImage && (
                <img src={previewImage} width="100%" height="100%" />
            )}
            {elements.length > 1 && (
                <div className="absolute bottom-0 right-0 bg-gray-950 flex items-center justify-center h-4 w-4 rounded-full mb-1 mr-1">
                    <span className="text-white text-2xs leading-none font-bold">{elements.length}</span>
                </div>
            )}
        </div>
    );
};

export type LayersProps = {
    maxHeight?: string,
};

// @description Layers panel component
// @param {object} props React props
// @param {string} [props.maxHeight] Maximum height of the layers panel
export const LayersContent = ({ maxHeight = "100vh - 5rem" }: LayersProps): JSX.Element => {
    // const [activeGroup, setActiveGroup] = React.useState("");
    const editor = useEditor();
    const activeGroup = editor.page.activeGroup || "";

    // generate a key to force the update of the groups map
    const key = editor.getElements().map((element: any) => element.id + "." + (element.group || ".")).join("-");

    // generate a map of groups in the board
    // each group contains the list of elements on it, the index of the group
    // and the last element of the group (to display the group item in the layers panel)
    const groups = useMemo(() => {
        const groupsMap = new Map();
        let currentGroupIndex = 1;
        editor.getElements().forEach((element: any) => {
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
    const visibleElements = useMemo(() => {
        // 1. activeGroup is not empty, return the elements on this group
        if (activeGroup) {
            return editor.getElements().filter((element: any) => element.group === activeGroup);
        }
        // 2. activeGroup is empty, return all the elements
        return editor.getElements();
    }, [editor, key, activeGroup]);

    // exit the current active group
    const handleCloseActiveGroup = useCallback(() => {
        editor.setCurrentTool(TOOLS.SELECT);
        editor.page.activeGroup = "";
        editor.update();
    }, [editor]);

    // handle click on a layer item
    const handleClick = useCallback((elements: any[]) => {
        if (!editor.page.readonly) {
            editor.setCurrentTool(TOOLS.SELECT);
            editor.setSelection(elements.map((el: any) => el.id));
            editor.update();
        }
    }, [editor, editor.page, editor.page.readonly]);

    // handle double click on a group item
    const handleDoubleClick = useCallback((groupId: string) => {
        if (!editor.page.readonly) {
            editor.setCurrentTool(TOOLS.SELECT);
            editor.page.activeGroup = groupId;
            editor.update();
        }
    }, [editor, editor.page, editor.page.readonly]);

    // calculate the container style
    const containerStyle = useMemo<CSSProperties>(() => {
        return {
            maxHeight: `calc(${maxHeight} - ${activeGroup ? "3rem" : "0rem"})`,
            scrollbarWidth: "none",
        } as React.CSSProperties;
    }, [activeGroup, maxHeight]);

    return (
        <Fragment>
            <div className="flex flex-col-reverse gap-2 overflow-y-auto" style={containerStyle}>
                {visibleElements.map((element: any) => (
                    <Fragment key={element.id + "." + (element.group || "")}>
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
                                active={groups.get(element.group).elements.some((el: any) => el.selected)}
                                onClick={() => handleClick(groups.get(element.group).elements)}
                                onDoubleClick={() => handleDoubleClick(element.group)}
                            />
                        )}
                    </Fragment>
                ))}
            </div>
            {activeGroup && (
                <div className="flex items-center justify-center mt-2">
                    <div className="cursor-pointer flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm border-1 border-gray-200" onClick={handleCloseActiveGroup}>
                        <CloseIcon />
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export const Layers = (props: PropsWithChildren): JSX.Element => {
    const content = props.children ?? <LayersContent />;
    return (
        <div className="absolute z-30 top-0 right-0 pointer-events-auto">
            {content}
        </div>
    );
};
