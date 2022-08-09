import React from "react";

// import {GRID_STYLES} from "../constants.js";
import ICONS from "../icons.js";
import {css} from "../styles.js";

import {Button} from "./Button.js";
import {Dialog} from "./Dialog.js";
import {Option} from "./Option.js";

const menubarWrapperClass = css({
    left: "0px",
    paddingLeft: "1rem",
    paddingTop: "1rem",
    position: "absolute",
    top: "0px",
    zIndex: "100",
});

const menubarClass = css({
    apply: "mixins.dialog",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "0.5rem",
    display:  "flex",
    gap: "0.125rem",
    padding: "0.5rem",
});

// const separatorClass = css({
//     backgroundColor: "primary",
//     height: "2rem",
//     marginLeft: "0.5rem",
//     marginRight: "0.5rem",
//     width: "0.125rem",
// });

const settingsOptions = {
    // gridStyle: {
    //     type: "select",
    //     props: {
    //         title: "Grid style",
    //         values: {
    //             [GRID_STYLES.DOTS]: ICONS.GRID_DOTS,
    //             [GRID_STYLES.LINES]: ICONS.GRID_LINES,
    //         },
    //     },
    // },
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
        <div className={menubarWrapperClass}>
            <div className={menubarClass}>
                {/* <div className={separatorClass} /> */}
                <Button
                    icon={ICONS.SLIDERS}
                    active={settingsVisible}
                    onClick={() => {
                        setSettingsVisible(!settingsVisible);
                    }}
                />
                <Button
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
    title: "Untitled",
    options: {},
    cameraEnabled: false,
    // gridEnabled: false,
    onOptionsChange: null,
};
