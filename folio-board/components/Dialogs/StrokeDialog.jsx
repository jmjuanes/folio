import React from "react";
import classNames from "classnames";

import {
    COLOR_KEYS,
    OPACITY_KEYS,
    SIZE_KEYS,
    DASH_KEYS,
} from "../../constants.js";
import {strokeColors} from "../../styles.js";
import {Dialog} from "./Dialog.jsx";
import {Form} from "../Form/index.jsx";
import {
    OpacityNoneIcon,
    OpacitySemiTransparentIcon,
    OpacityTransparentIcon,
    CircleSolidIcon,
    CircleDashedIcon,
    CircleDottedIcon,
} from "../icons/index.jsx";
import {useStyleValues} from "../../hooks/useStyleValues.js";

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
        type: "select",
        title: "Stroke Opacity",
        values: [
            {value: OPACITY_KEYS.NONE, icon: OpacityNoneIcon()},
            {value: OPACITY_KEYS.SEMI_TRANSPARENT, icon: OpacitySemiTransparentIcon()},
            {value: OPACITY_KEYS.TRANSPARENT, icon: OpacityTransparentIcon()},
        ],
    },
};

export const StrokeDialog = props => {
    const values = useStyleValues(props.elements, props.defaultValues);
    return (
        <Dialog className="pt-4 right-0 top-0 pr-24" style={{paddingRight:"5rem"}}>
            <Form
                data={props.values || {}}
                items={options}
                onChange={props.onChange}
            />
        </Dialog>
    );
};

StrokeDialog.defaultProps = {
    defaultValues: {},
    elements: [],
    onChange: null,
};
