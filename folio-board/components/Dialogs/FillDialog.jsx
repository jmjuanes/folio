import React from "react";
import classNames from "classnames";
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
    <Dialog className={classNames("pt:4 right:0 top:0 pr:28", props.className)}>
        <Form
            data={props.values || {}}
            items={options}
            onChange={props.onChange}
        />
    </Dialog>
);

FillDialog.defaultProps = {
    className: "",
    values: {},
    onChange: null,
};
