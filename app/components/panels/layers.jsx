import React from "react";
import {StackIcon, renderIcon, CheckIcon} from "@josemi-icons/react";
import {useScene} from "../../contexts/scene.jsx";
import {exportToDataURL} from "../../export.js";
import {FIELDS, TRANSPARENT} from "../../constants.js";
import transparentBg from "../../assets/transparent.svg";

// Tiny hook to generate the preview of the element
const useElementPreview = (elements, dependencies = []) => {
    const [previewImage, setPreviewImage] = React.useState(null);
    React.useEffect(() => {
        // if (elements.length > 1 || !) {
        //     const previewOptions = {
        //         elements: elements,
        //         width: 32,
        //         height: 32,
        //         background: TRANSPARENT,
        //     };
        //     exportToDataURL(previewOptions).then(image => {
        //         setPreviewImage(image);
        //     });
        // }
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
            <div className="shrink-0 w-8 h-8 border border-neutral-200 rounded-md bg-white" style={previewStyle}>
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

const LayerGroup = props => {

};

export const LayersPanel = props => {
    const scene = useScene();
    const key = scene.page.elements.map(el => el.id + "." + (el.group || ".")).join("-");
    const elementsTree = React.useMemo(() => {
        const currentTree = [];
        scene.page.elements.forEach(element => {
            // Check if this element is inside a group
            if (element.group) {
                // Check if we need to initialize the group in the current tree
                if (currentTree.length === 0 || currentTree[currentTree.length - 1]?.group !== element.group) {
                    currentTree.push({group: element.group, elements: []});
                }
                // Add this element to the current tree
                currentTree[currentTree.length - 1].elements.push(element);
            }
            // Other case, add as a single element
            else {
                currentTree.push(element);
            }
        });
        return currentTree;
    }, [key]);
    return (
        <div className="w-56 border border-neutral-200 rounded-xl shadow-md bg-white p-2 overflow-y-auto" style={{maxHeight:"calc(100vh - 5rem)"}}>
            <div className="flex flex-col-reverse gap-1">
                {elementsTree.map(element => (
                    <React.Fragment>
                        {element.group && element.elements?.length > 0 && (
                            <div>Group</div>
                        )}
                        {!element.group && (
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
