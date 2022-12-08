import React from "react";
import classNames from "classnames";

import {COLOR_KEYS, FONT_KEYS, SIZE_KEYS} from "../../constants.js";
import {strokeColors, fontFaces} from "../../styles.js";
import {Dialog} from "./Dialog.jsx";
import {Form} from "../Form/index.jsx";
import {useStyleValues} from "../../hooks/useStyleValues.js";

const options = {
    textColor: {
        type: "color",
        title: "Text Color",
        values: Object.values(COLOR_KEYS).map(key => ({
            value: key,
            // color: textColors[key],
            color: strokeColors[key],
        })),
    },
    textFont: {
        type: "font",
        title: "Text Font",
        values: [
            {value: FONT_KEYS.SANS, font: fontFaces[FONT_KEYS.SANS]},
            {value: FONT_KEYS.SERIF, font: fontFaces[FONT_KEYS.SERIF]},
            // {value: FONT_KEYS.SANS, font: fontFaces[FONT_KEYS.SANS]},
            {value: FONT_KEYS.MONO, font: fontFaces[FONT_KEYS.MONO]},
        ],
    },
    textSize: {
        type: "select",
        title: "Text Size",
        values: [
            {value: SIZE_KEYS.SMALL, text: "S"},
            {value: SIZE_KEYS.MEDIUM, text: "M"},
            {value: SIZE_KEYS.LARGE, text: "L"},
            {value: SIZE_KEYS.XLARGE, text: "XL"},
        ],
    },
};

export const TextDialog = props => {
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

TextDialog.defaultProps = {
    defaultValues: {},
    elements: [],
    onChange: null,
};
