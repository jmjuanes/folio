import React from "react";
import {TextCenterIcon, TextLeftIcon, TextRightIcon, TextJustifyIcon} from "@mochicons/react";
import {COLORS, TEXT_SIZES, FONT_FACES, TEXT_ALIGNS} from "folio-core";
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
    textAlign: {
        type: "select",
        title: "Text Align",
        values: [
            {value: TEXT_ALIGNS.LEFT, icon: TextLeftIcon()},
            {value: TEXT_ALIGNS.CENTER, icon: TextCenterIcon()},
            {value: TEXT_ALIGNS.RIGHT, icon: TextRightIcon()},
            {value: TEXT_ALIGNS.JUSTIFY, icon: TextJustifyIcon()},
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
    className: "pt-4 right-0 top-0 pr-24",
    style: {},
    values: {},
    onChange: null,
};
