import React from "react";
import classNames from "classnames";
import {COLORS, FONTS, SIZES} from "folio-core";
import {strokeColors, fontFaces} from "../../styles.js";
import {Dialog} from "./Dialog.jsx";
import {Form} from "../Form/index.jsx";

const options = {
    textColor: {
        type: "color",
        title: "Text Color",
        values: Object.values(COLORS).map(key => ({
            value: key,
            // color: textColors[key],
            color: strokeColors[key],
        })),
    },
    textFont: {
        type: "font",
        title: "Text Font",
        values: [
            {value: FONTS.SANS, font: fontFaces[FONTS.SANS]},
            {value: FONTS.SERIF, font: fontFaces[FONTS.SERIF]},
            {value: FONTS.DRAW, font: fontFaces[FONTS.DRAW]},
            {value: FONTS.MONO, font: fontFaces[FONTS.MONO]},
        ],
    },
    textSize: {
        type: "select",
        title: "Text Size",
        values: [
            {value: SIZES.SMALL, text: "S"},
            {value: SIZES.MEDIUM, text: "M"},
            {value: SIZES.LARGE, text: "L"},
            {value: SIZES.XLARGE, text: "XL"},
        ],
    },
};

export const TextDialog = props => (
    <Dialog className={classNames("pt:4 right:0 top:0 pr:28", props.className)}>
        <Form
            data={props.values || {}}
            items={options}
            onChange={props.onChange}
        />
    </Dialog>
);

TextDialog.defaultProps = {
    className: "",
    values: {},
    onChange: null,
};
