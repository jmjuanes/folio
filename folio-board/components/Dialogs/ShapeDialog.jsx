import React from "react";
import classNames from "classnames";
import {SHAPES} from "../../constants.js";
import {Dialog} from "./Dialog.jsx";
import {
    RectangleIcon,
    CircleIcon,
    TriangleIcon,
    DiamondIcon,
} from "../icons/index.jsx";

const shapeIcons = {
    [SHAPES.RECTANGLE]: RectangleIcon(),
    [SHAPES.ELLIPSE]: CircleIcon(),
    [SHAPES.DIAMOND]: DiamondIcon(),
    [SHAPES.TRIANGLE]: TriangleIcon(),
};

const ShapeButton = props => {
    const className = classNames({
        "d-flex justify-center items-center": true,
        "r-md cursor-pointer p-2 w-full text-lg": true,
        "bg-gray-900 text-white": props.values?.shape === props.shape,
    });
    return (
        <div className={className} onClick={() => props.onChange("shape", props.shape)}>
            {shapeIcons[props.shape]}
        </div>
    );
};

export const ShapeDialog = props => (
    <Dialog className="pt-4 right-0 top-0 pr-24" width="7rem" style={{paddingRight:"5rem"}}>
        <div className="font-bold text-sm mb-4">Shapes</div>
        <div className="d-grid gap-1 grid-cols-2 w-full">
            {Object.values(SHAPES).map(shape => (
                <ShapeButton
                    key={shape}
                    shape={shape}
                    values={props.values}
                    onChange={props.onChange}
                />
            ))}
        </div>
    </Dialog>
);

ShapeDialog.defaultProps = {
    values: {},
    onChange: null,
};
