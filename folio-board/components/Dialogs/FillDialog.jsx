import React from "react";
import {OPACITY_MIN, OPACITY_MAX, OPACITY_STEP, COLORS} from "folio-core";
import {Dialog} from "./Dialog.jsx";
import {Form} from "../Form/index.jsx";

const options = {
    fillColor: {
        type: "color",
        title: "Fill Color",
        values: Object.values(COLORS),
    },
    fillOpacity: {
        type: "range",
        title: "Fill Opacity",
        minValue: OPACITY_MIN,
        maxValue: OPACITY_MAX,
        step: OPACITY_STEP,
    },
};

export const FillDialog = props => (
    <Dialog className={props.className} style={props.style}>
        <Form
            data={props.values || {}}
            items={options}
            onChange={props.onChange}
        />
    </Dialog>
);

FillDialog.defaultProps = {
    className: "pt:4 right:0 top:0 pr:24",
    style: {},
    values: {},
    onChange: null,
};
