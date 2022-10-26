import React from "react";

import {DEFAULT_APP_TITLE, MODES} from "../constants.js";
import ICONS from "../icons.js";

import {Button} from "./Button.js";
import {Dialog} from "./Dialog.js";
import {Option} from "./Option.js";

const settingsOptions = {
    gridEnabled: {
        type: "switch",
        props: {
            title: "Grid enabled",
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
        <div className="position-absolute left-0 top-0 pl-4 pt-4 z-10">
            <div className="b-1 b-solid b-gray-900 r-md shadow-md items-center bg-white d-flex gap-1 p-2">
                <div className="font-garamond text-2xl weight-extrabold ml-2 mr-4">
                    {props.title}
                </div>
                <Button
                    icon={ICONS.SLIDERS}
                    active={settingsVisible}
                    onClick={() => {
                        setSettingsVisible(!settingsVisible);
                    }}
                />
                {typeof props.onLoadClick === "function" && (
                    <Button
                        icon={ICONS.FOLDER}
                        onClick={() => {
                            setSettingsVisible(false);
                            props.onLoadClick();
                        }}
                    />
                )}
                <Button
                    icon={ICONS.SAVE}
                    onClick={() => {
                        setSettingsVisible(false);
                        typeof props.onSaveClick === "function" && props.onSaveClick();
                    }}
                />
                <Button
                    icon={ICONS.CAMERA}
                    active={props.mode === MODES.SCREENSHOT}
                    onClick={() => {
                        setSettingsVisible(false);
                        typeof props.onCameraClick === "function" && props.onCameraClick();
                    }}
                />
                <Button
                    icon={ICONS.DOWNLOAD}
                    onClick={() => {
                        setSettingsVisible(false);
                        typeof props.onExportClick === "function" && props.onExportClick();
                    }}
                />
            </div>
            <Dialog active={settingsVisible} style={{marginTop: "0.125rem"}}>
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
    title: DEFAULT_APP_TITLE,
    options: {},
    mode: null,
    onOptionsChange: null,
    onCameraClick: null,
    onExportClick: null,
    onSaveClick: null,
    onLoadClick: null,
};
