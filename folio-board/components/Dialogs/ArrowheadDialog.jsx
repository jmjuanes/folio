import React from "react";
import {ARROWHEADS} from "folio-core";
import {Dialog} from "./Dialog.jsx";
import {Form} from "../Form/index.jsx";
import {
    ArrowheadNoneIcon,
    ArrowheadArrowIcon,
    ArrowheadTriangleIcon,
    ArrowheadSquareIcon,
    ArrowheadCircleIcon,
    ArrowheadSegmentIcon,
} from "../icons/index.jsx";

const arrowheadValues = [
    {value: ARROWHEADS.NONE, icon: ArrowheadNoneIcon()},
    {value: ARROWHEADS.ARROW, icon: ArrowheadArrowIcon()},
    {value: ARROWHEADS.TRIANGLE, icon: ArrowheadTriangleIcon()},
    {value: ARROWHEADS.SQUARE, icon: ArrowheadSquareIcon()},
    {value: ARROWHEADS.CIRCLE, icon: ArrowheadCircleIcon()},
    {value: ARROWHEADS.SEGMENT, icon: ArrowheadSegmentIcon()},
];

const options = {
    startArrowhead: {
        type: "select",
        title: "Start Arrowhead",
        // grid: 3,
        values: arrowheadValues,
    },
    endArrowhead: {
        type: "select",
        title: "End Arrowhead",
        // grid: 3,
        values: arrowheadValues,
    },
};

export const ArrowheadDialog = props => (
    <Dialog className={props.className} style={props.style}>
        <Form
            data={props.values || {}}
            items={options}
            onChange={props.onChange}
        />
    </Dialog>
);

ArrowheadDialog.defaultProps = {
    className: "right-0 top-0 pt-4 pr-24",
    values: {},
    style: {},
    onChange: null,
};
