import React from "react";
import {ARROWHEADS} from "../../constants.js";
import {Dialog} from "./Dialog.jsx";
import {Form} from "../Form/index.jsx";
// import {} from "../icons/index.jsx";

const options = {
    startArrowhead: {
        type: "select",
        title: "Start Arrowhead",
        values: Object.values(ARROWHEADS).map(key => ({
            value: key,
            text: key,
        })),
    },
    endArrowhead: {
        type: "select",
        title: "End Arrowhead",
        values: Object.values(ARROWHEADS).map(key => ({
            value: key,
            text: key,
        })),
    },
};

export const ArrowheadDialog = props => (
    <Dialog className="pt-4 right-0 top-0 pr-24" style={{paddingRight:"5rem"}}>
        <Form
            data={props.values || {}}
            items={options}
            onChange={props.onChange}
        />
    </Dialog>
);

ArrowheadDialog.defaultProps = {
    values: {},
    onChange: null,
};
