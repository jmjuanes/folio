import React from "react";
import {SidePanel} from "./SidePanel.jsx";
import {Form} from "../Form/index.jsx";

const options = {
    grid: {
        title: "Grid",
        type: "switch",
    },
};

export const SettingsPanel = props => (
    <SidePanel title="Settings" onClose={props.onClose}>
        <Form
            data={props.values || {}}
            items={options}
            onChange={props.onChange}
        />
    </SidePanel>
);

SettingsPanel.defaultProps = {
    values: {},
};
