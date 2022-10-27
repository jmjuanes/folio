import React from "react";

import {MODES} from "../../constants.js";
import {Panel, PanelButton} from "./index.jsx";
import {
    SaveIcon,
    CameraIcon,
    DownloadIcon,
} from "../Icons.jsx";

export const MenuPanel = props => (
    <Panel position="top-left">
        {/* Save button */}
        <PanelButton onClick={props.onSaveClick}>
            <SaveIcon />
        </PanelButton>
        {/* Screenshot button */}
        <PanelButton active={props.mode === MODES.SCREENSHOT} onClick={props.onCameraClick}>
            <CameraIcon />
        </PanelButton>
        {/* Export button */}
        <PanelButton onClick={props.onExportClick}>
            <DownloadIcon />
        </PanelButton>
    </Panel>
);

MenuPanel.defaultProps = {
    mode: null,
    onScreenshotClick: null,
    onExportClick: null,
    onSaveClick: null,
};
