import React from "react";
import classNames from "classnames";
import {renderIcon} from "@josemi-icons/react";
import {useScene} from "../../contexts/scene.jsx";
import {exportToDataURL} from "../../export.js";
import { TRANSPARENT } from "../../constants.js";

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
    const classList = classNames({
        "group flex justify-between p-2 rounded-lg": true,
        "hover:bg-neutral-100": !props.element.selected,
        "bg-neutral-100": props.element.selected,
    });
    React.useEffect(() => {
        const previewOptions = {
            elements: [props.element],
            width: 32,
            height: 32,
            background: TRANSPARENT,
        };
        exportToDataURL(previewOptions).then(image => {
            setPreviewImage(image);
        });
    }, [props.element.id]);
    return (
        <div className={classList}>
            <div className="w-8 h-8 border border-neutral-200 rounded-md bg-white" style={previewStyle} onClick={props.onClick}>
                {previewImage && (
                    <img src={previewImage} width="100%" height="100%" />
                )}
            </div>
            <div className="flex gap-1 items-center group-hover:opacity-100 opacity-0">
                <LayerItemAction icon="trash" onClick={props.onDeleteClick} />
            </div>
        </div>
    );
};

export const LayersPanel = props => {
    const scene = useScene();
    return (
        <div className="w-40 border border-neutral-200 rounded-xl shadow-md bg-white p-2">
            <div className="flex flex-col-reverse gap-1">
                {scene.page.elements.map(element => (
                    <LayerItem
                        key={element.id}
                        element={element}
                        onClick={() => props?.onElementSelect(element)}
                        onDeleteClick={() => props?.onElementDelete(element)}
                    />
                ))}
            </div>
        </div>
    );
};
