import React from "react";
import {SidePanel} from "./SidePanel.jsx";

export const ExportPanel = props => (
    <SidePanel title="Export" submitText="Export Image" onClose={props.onClose} onSubmit={props.onSubmit}>
        Content
    </SidePanel>
);

ExportPanel.defaultProps = {
    values: {},
    onChange: null,
    onSubmit: null,
    onClose: null,
};
