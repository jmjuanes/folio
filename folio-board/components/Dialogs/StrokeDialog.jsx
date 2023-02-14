import React from "react";
import {STROKES, STROKE_WIDTHS, COLORS} from "folio-core";
import {OPACITY_STEP, OPACITY_MIN, OPACITY_MAX} from "folio-core";
import {Dialog} from "./Dialog.jsx";
import {Form} from "../Form/index.jsx";
import {
    CircleSolidIcon,
    CircleDashedIcon,
    CircleDottedIcon,
} from "../icons/index.jsx";

const options = {
    strokeColor: {
        type: "color",
        title: "Stroke color",
        values: Object.values(COLORS),
    },
    strokeWidth: {
        type: "select",
        title: "Stroke Width",
        values: [
            {value: STROKE_WIDTHS.SMALL, text: "S"},
            {value: STROKE_WIDTHS.MEDIUM, text: "M"},
            {value: STROKE_WIDTHS.LARGE, text: "L"},
            {value: STROKE_WIDTHS.XLARGE, text: "XL"},
        ],
    },
    strokeStyle: {
        type: "select",
        title: "Stroke Style",
        values: [
            {value: STROKES.SOLID, icon: CircleSolidIcon()},
            {value: STROKES.DASHED, icon: CircleDashedIcon()},
            {value: STROKES.DOTTED, icon: CircleDottedIcon()},
        ],
    },
    strokeOpacity: {
        type: "range",
        title: "Stroke Opacity",
        minValue: OPACITY_MIN,
        maxValue: OPACITY_MAX,
        step: OPACITY_STEP,
    },
};

export const StrokeDialog = props => (
    <Dialog className={props.className} style={props.style}>
        <Form
            data={props.values || {}}
            items={options}
            onChange={props.onChange}
        />
    </Dialog>
);

StrokeDialog.defaultProps = {
    className: "pt:4 right:0 top:0 pr:28",
    style: {},
    values: {},
    onChange: null,
};
