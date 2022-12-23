import React from "react";
import {
    COLOR_KEYS,
    OPACITY_STEP,
    OPACITY_MIN,
    OPACITY_MAX,
    SIZE_KEYS,
    DASH_KEYS,
} from "../../constants.js";
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
        values: Object.values(COLOR_KEYS).map(key => ({
            value: key,
            color: strokeColors[key],
        })),
    },
    strokeWidth: {
        type: "select",
        title: "Stroke Width",
        values: [
            {value: SIZE_KEYS.SMALL, text: "S"},
            {value: SIZE_KEYS.MEDIUM, text: "M"},
            {value: SIZE_KEYS.LARGE, text: "L"},
            {value: SIZE_KEYS.XLARGE, text: "XL"},
        ],
    },
    strokeStyle: {
        type: "select",
        title: "Stroke Style",
        values: [
            {value: DASH_KEYS.SOLID, icon: CircleSolidIcon()},
            {value: DASH_KEYS.DASHED, icon: CircleDashedIcon()},
            {value: DASH_KEYS.DOTTED, icon: CircleDottedIcon()},
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
    <Dialog className="pt:4 right:0 top:0 pr:28">
        <Form
            data={props.values || {}}
            items={options}
            onChange={props.onChange}
        />
    </Dialog>
);

StrokeDialog.defaultProps = {
    values: {},
    onChange: null,
};
