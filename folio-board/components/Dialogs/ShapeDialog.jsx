import React from "react";
import classNames from "classnames";
import {SHAPES} from "folio-core";
import {Dialog} from "./Dialog.jsx";
import {Form} from "../Form/index.jsx";
import {
    RectangleIcon,
    CircleIcon,
    TriangleIcon,
    DiamondIcon,
} from "../icons/index.jsx";

const options = {
    shape: {
        type: "select",
        title: "Shape",
        grid: 2,
        values: [
            {value: SHAPES.RECTANGLE, icon: RectangleIcon()},
            {value: SHAPES.ELLIPSE, icon: CircleIcon()},
            {value: SHAPES.DIAMOND, icon: DiamondIcon()},
            {value: SHAPES.TRIANGLE, icon: TriangleIcon()},
        ],
    },
};

export const ShapeDialog = props => (
    <Dialog className={classNames("pt:4 right:0 top:0 pr:28", props.className)} width="10rem">
        <Form
            data={props.values || {}}
            items={options}
            onChange={props.onChange}
        />
    </Dialog>
);

ShapeDialog.defaultProps = {
    className: "",
    values: {},
    onChange: null,
};
