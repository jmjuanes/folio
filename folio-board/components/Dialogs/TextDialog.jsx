import React from "react";
import {COLORS, TEXT_SIZES, FONT_FACES} from "folio-core";
import {Dialog} from "./Dialog.jsx";
import {Form} from "../Form/index.jsx";

const options = {
    textColor: {
        type: "color",
        title: "Text Color",
        values: Object.values(COLORS),
    },
    textFont: {
        type: "font",
        title: "Text Font",
        values: Object.values(FONT_FACES),
    },
    textSize: {
        type: "select",
        title: "Text Size",
        values: [
            {value: TEXT_SIZES.SMALL, text: "S"},
            {value: TEXT_SIZES.MEDIUM, text: "M"},
            {value: TEXT_SIZES.LARGE, text: "L"},
            {value: TEXT_SIZES.XLARGE, text: "XL"},
        ],
    },
};

export const TextDialog = props => (
    <Dialog className={props.className} style={props.style}>
        <Form
            data={props.values || {}}
            items={options}
            onChange={props.onChange}
        />
    </Dialog>
);

TextDialog.defaultProps = {
    className: "pt:4 right:0 top:0 pr:28",
    style: {},
    values: {},
    onChange: null,
};
