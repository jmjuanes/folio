import React from "react";
import {COLOR_KEYS, OPACITY_KEYS} from "../../constants.js";
import {fillColors} from "../../styles.js";
import {Dialog} from "./Dialog.jsx";
import {Form} from "../Form/index.jsx";
import {
    OpacityNoneIcon,
    OpacitySemiTransparentIcon,
    OpacityTransparentIcon,
} from "../icons/index.jsx";

const options = {
    fillColor: {
        type: "color",
        title: "Fill Color",
        values: Object.values(COLOR_KEYS).map(key => ({
            value: key,
            color: fillColors[key],
        })),
    },
    fillOpacity: {
        type: "select",
        title: "Fill Opacity",
        values: [
            {value: OPACITY_KEYS.NONE, icon: OpacityNoneIcon()},
            {value: OPACITY_KEYS.SEMI_TRANSPARENT, icon: OpacitySemiTransparentIcon()},
            {value: OPACITY_KEYS.TRANSPARENT, icon: OpacityTransparentIcon()},
        ],
    },
};

export const FillDialog = props => (
    <Dialog className="pt:4 right:0 top:0 pr:28">
        <Form
            data={props.values || {}}
            items={options}
            onChange={props.onChange}
        />
    </Dialog>
);

FillDialog.defaultProps = {
    values: {},
    onChange: null,
};
