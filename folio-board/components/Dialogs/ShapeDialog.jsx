import React from "react";
import classNames from "classnames";

import {SHAPES} from "../../constants.js";
import {
    RectangleIcon,
    EllipseIcon,
} from "../icons/index.jsx";
import {useElementsValues} from "../../hooks/useElementsValues.js";

const shapeIcons = {
    [SHAPES.RECTANGLE]: RectangleIcon(),
    [SHAPES.ELLIPSE]: EllipseIcon(),
    [SHAPES.DIAMOND]: RectangleIcon(),
    [SHAPES.TRIANGLE]: RectangleIcon(),
};

export const ShapeDialog = props => {
    const values = useElementsValues(props.elements, props.defaultValues);
    return (
        <Dialog className="pt-4 right-0 top-0 pr-24" width="10rem" style={{paddingRight:"5rem"}}>
            <div className="d-grid gap-1 grid-cols-2 w-full">
                {Object.values(SHAPES).map(shape => (
                    <div
                        key={shape}
                        className={classNames({
                            "d-flex justify-center items-center": true,
                            "r-md cursor-pointer p-2 w-full text-lg": true,
                            "bg-gray-900 text-white": value.shape === shape,
                        })}
                        onClick={() => props.onChange("shape", shape)}
                    >
                        {shapeIcons[shape]}
                    </div>
                ))}
            </div>
        </Dialog>
    );
};

ShapeDialog.defaultProps = {
    defaultValues: {},
    elements: [],
    onChange: null,
};
