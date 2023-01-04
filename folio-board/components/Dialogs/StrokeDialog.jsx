import React from "react";
import classNames from "classnames";
import {
    COLORS,
    SIZES,
    STROKES,
    OPACITY_STEP,
    OPACITY_MIN,
    OPACITY_MAX,
} from "folio-core";
import {strokeColors} from "../../styles.js";
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
        values: Object.values(COLORS).map(key => ({
            value: key,
            color: strokeColors[key],
        })),
    },
    strokeWidth: {
        type: "select",
        title: "Stroke Width",
        values: [
            {value: SIZES.SMALL, text: "S"},
            {value: SIZES.MEDIUM, text: "M"},
            {value: SIZES.LARGE, text: "L"},
            {value: SIZES.XLARGE, text: "XL"},
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
    <Dialog className={classNames("pt:4 right:0 top:0 pr:28", props.className)}>
        <Form
            data={props.values || {}}
            items={options}
            onChange={props.onChange}
        />
    </Dialog>
);

StrokeDialog.defaultProps = {
    className: "",
    values: {},
    onChange: null,
};
