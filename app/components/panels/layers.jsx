import React from "react";
import {useUpdate} from "react-use";
import {StackIcon, renderIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon} from "@josemi-icons/react";
import {useScene} from "../../contexts/scene.jsx";
import {exportToDataURL} from "../../export.js";
import {FIELDS, TRANSPARENT} from "../../constants.js";
import transparentBg from "../../assets/transparent.svg";
import classNames from "classnames";

// Tiny hook to generate the preview of the element
const useElementPreview = (elements, dependencies = []) => {
    const [previewImage, setPreviewImage] = React.useState(null);
    React.useEffect(() => {
        if (elements.length > 1 || !elements[0]?.[FIELDS.CREATING]) {
            const previewOptions = {
                elements: elements,
                width: 32,
                height: 32,
                background: TRANSPARENT,
            };
            exportToDataURL(previewOptions).then(image => {
                setPreviewImage(image);
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

const LayerItemAction = props => (
    <div className="flex text-lg text-neutral-500 hover:text-neutral-900 cursor-pointer" onClick={props.onClick}>
        {renderIcon(props.icon)}
    </div>
);

const LayerItem = props => {
    const element = props.element;
    const previewImage = useElementPreview([element], [element[FIELDS.CREATING], element[FIELDS.EDITING], element[FIELDS.VERSION]]);
    return (
        <div className="group flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-neutral-100" onClick={props.onClick}>
            <div className="shrink-0 w-4">
                {element.selected && (
                    <div className="flex items-center text-sm">
                        <CheckIcon />
                    </div> 
                )}
            </div>
            <div className="shrink-0 w-6 h-6 border border-neutral-200 rounded-md bg-white" style={previewStyle}>
                {previewImage && (
                    <img src={previewImage} width="100%" height="100%" />
                )}
            </div>
            <div className="flex items-center grow">
                <span className="text-xs font-medium text-neutral-700">Layer {props.element.order + 1}</span>
            </div>
            <div className="flex flex-row-reverse shrink-0 gap-1 items-center group-hover:opacity-100 opacity-0">
                <LayerItemAction icon="trash" onClick={props.onDeleteClick} />
                <LayerItemAction icon="copy" onClick={props.onDuplicateClick} />
            </div>
        </div>
    );
};

const LayerGroupItem = props => {
    const previewImage = useElementPreview(props.elements, props.elements.map(el => el.version));
    return (
        <div className="flex items-center gap-2 p-2" onClick={props.onClick}>
            <div className="shrink-0 w-4 flex items-center text-sm">
                {props.expanded ? (<ChevronDownIcon />) : (<ChevronRightIcon />)}
            </div>
            <div className="shrink-0 w-6 h-6 border border-neutral-200 rounded-md bg-white" style={previewStyle}>
                {previewImage && (
                    <img src={previewImage} width="100%" height="100%" />
                )}
            </div>
            <div className="flex items-center grow">
                <span className="text-xs font-medium text-neutral-700">Group {props.index}</span>
            </div>
        </div>
    );
};

export const LayersPanel = props => {
    const expandedGroups = React.useRef(new Set());
    const scene = useScene();
    const update = useUpdate();
    const key = scene.page.elements.map(el => el.id + "." + (el.group || ".")).join("-");
    const groups = React.useMemo(() => {
        const groupsMap = new Map();
        let currentGroupIndex = 1;
        scene.page.elements.forEach(element => {
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
    // Automatically expand groups with selected items
    React.useEffect(() => {
        let shouldUpdate = false;
        // 1. Check if there is a selected element inside a group
        scene.page.elements.forEach(element => {
            if (element.group && element.selected && scene.page.activeGroup === element.group) {
                expandedGroups.current.add(element.group);
                shouldUpdate = true;
            }
        });
        // 2. Trigger an update if we have added at least one group
        // in the list of expanded groups
        if (expandedGroups.current.size > 0 && shouldUpdate) {
            update();
        }
    }, [scene.page.activeGroup]);
    return (
        <div className="w-64 border border-neutral-200 rounded-xl shadow-md bg-white p-2 overflow-y-auto" style={{maxHeight:"calc(100vh - 5rem)"}}>
            <div className="flex flex-col-reverse gap-0">
                {scene.page.elements.map(element => (
                    <React.Fragment key={element.id + "." + (element.group || "")}>
                        {(!element.group || expandedGroups.current.has(element.group)) && (
                            <div className={classNames(!!element.group && "ml-4")}>
                                <LayerItem
                                    key={element.id}
                                    element={element}
                                    onClick={() => props?.onElementSelect(element)}
                                    onDeleteClick={event => {
                                        event.stopPropagation();
                                        props?.onElementDelete(element);
                                    }}
                                    onDuplicateClick={event => {
                                        event.stopPropagation();
                                        props?.onElementDuplicate(element);
                                    }}
                                />
                            </div>
                        )}
                        {element.group && groups.get(element.group).lastElement === element.id && (
                            <LayerGroupItem
                                key={element.group}
                                index={groups.get(element.group).index}
                                elements={groups.get(element.group).elements}
                                expanded={expandedGroups.current.has(element.group)}
                                onClick={() => {
                                    if (expandedGroups.current.has(element.group)) {
                                        expandedGroups.current.delete(element.group);
                                    }
                                    else {
                                        expandedGroups.current.add(element.group);
                                    }
                                    update();
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}
                {scene.page.elements.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-3 border border-dashed border-neutral-300 rounded-lg">
                        <div className="flex items-center text-xl text-neutral-600">
                            <StackIcon />
                        </div>
                        <div className="text-center text-neutral-500 text-2xs font-medium">No layers to display</div>
                    </div>
                )}
            </div>
        </div>
    );
};
