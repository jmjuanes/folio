import React from "react";
import classNames from "classnames";
import {StackIcon, renderIcon, CheckIcon} from "@josemi-icons/react";
import {useScene} from "../../contexts/scene.jsx";
import {exportToDataURL} from "../../export.js";
import {FIELDS, TRANSPARENT} from "../../constants.js";

import transparentBg from "../../assets/transparent.svg";

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
    const [previewImage, setPreviewImage] = React.useState(null);
    // const classList = classNames({
    //     "group flex justify-between p-2 rounded-lg cursor-pointer": true,
    //     "hover:bg-neutral-100": !props.element.selected,
    //     "bg-neutral-100": props.element.selected,
    // });
    React.useEffect(() => {
        if (!props.element.creating) {
            const previewOptions = {
                elements: [props.element],
                width: 32,
                height: 32,
                background: TRANSPARENT,
            };
            exportToDataURL(previewOptions).then(image => {
                setPreviewImage(image);
            });
        }
    }, [props.element[FIELDS.CREATING], props.element[FIELDS.EDITING], props.element[FIELDS.VERSION]]);
    return (
        <div className="group flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-neutral-100" onClick={props.onClick}>
            <div className="shrink-0 w-4">
                {props.element.selected && (
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

export const LayersPanel = props => {
    const scene = useScene();
    return (
        <div className="w-56 border border-neutral-200 rounded-xl shadow-md bg-white p-2 overflow-y-auto" style={{maxHeight:"calc(100vh - 5rem)"}}>
            <div className="flex flex-col-reverse gap-1">
                {scene.page.elements.map(element => (
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
