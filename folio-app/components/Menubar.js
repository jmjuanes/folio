import React from "react";
import {GRID_STYLES} from "@folio/lib/constants.js";

import {Button} from "./Button.js";
import {Dialog} from "./Dialog.js";
import {Option} from "./Option.js";
import ICONS from "../icons.js";

const settingsOptions = {
    gridStyle: {
        type: "selectIcon",
        props: {
            title: "Grid style",
            values: {
                [GRID_STYLES.DOTS]: ICONS.GRID_DOTS,
                [GRID_STYLES.LINES]: ICONS.GRID_LINES,
            },
        },
    },
    gridColor: {
        type: "color",
        props: {
            title: "Grid color",
            colors: null, // colors.fillColors,
        },
    },
    gridOpacity: {
        type: "range",
        props: {
            title: "Grid opacity",
            domain: [0, 1],
            step: 0.1,
        },
    },
    gridSize: {
        type: "range",
        props: {
            title: "Grid size",
            domain: [1, 50],
            step: 1,
        },
    },
};

export const Menubar = props => {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    const [settingsVisible, setSettingsVisible] = React.useState(false);

    return (
        <div
            className="is-absolute has-top-none has-left-none has-pt-4 has-pl-4"
            style={{
                zIndex: 100,
            }}
        >
            <div className="has-radius-md is-bordered has-p-2 is-flex has-items-center has-shadow-lg has-bg-white">
                <Button
                    icon={ICONS.CORNERS}
                    active={false}
                    onClick={() => {
                        return null;
                    }}
                />
                <div className="has-mx-4 has-size-2 has-maxw-48 has-minw-24">
                    <strong>{props.title}</strong>
                </div>
                <div className="has-bg-body has-mx-2 has-h-8" style={{width: "2px"}} />
                <Button
                    className="has-ml-1"
                    icon={ICONS.SLIDERS}
                    active={settingsVisible}
                    onClick={() => {
                        setSettingsVisible(!settingsVisible);
                    }}
                />
                <Button
                    className="has-ml-1"
                    icon={ICONS.GRID_LINES}
                    active={props.gridEnabled}
                    onClick={props.onGridClick}
                />
                <Button
                    className="has-ml-1"
                    icon={ICONS.CAMERA}
                    active={props.cameraEnabled}
                    onClick={() => {
                        setSettingsVisible(false);
                        if (typeof props.onCameraClick === "function") {
                            props.onCameraClick();
                        }
                    }}
                />
            </div>
            <Dialog active={settingsVisible} className="has-mt-2">
                {Object.keys(settingsOptions).map(name => (
                    <Option
                        {...settingsOptions[name].props}
                        key={name}
                        type={settingsOptions[name].type}
                        value={props.options[name]}
                        onChange={value => {
                            props.onOptionsChange(name, value);
                            forceUpdate();
                        }}
                    />
                ))}
            </Dialog>
        </div>
    );
};

Menubar.defaultProps = {
    title: "Untitled",
    options: {},
    cameraEnabled: false,
    gridEnabled: false,
    onOptionsChange: null,
};
