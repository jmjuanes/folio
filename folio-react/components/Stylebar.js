import React from "react";
import {classNames} from "@siimple/styled";

import {
    LINE_CAPS,
    TEXT_ALIGNS,
    LIGHT_COLORS,
    DARK_COLORS,
} from "../constants.js";

import {Dialog} from "./Dialog.js";
import {Button} from "./Button.js";
import {Option} from "./Option.js";
import ICONS from "../icons.js";
import {css} from "../styles.js";

const stylebarWrapperClass = css({
    display: "none",
    marginRight: "1rem",
    marginTop: "1rem",
    position: "absolute",
    right: "0px",
    top: "0px",
    "&.is-visible": {
        display: "block",
    },
});

const stylebarClass = css({
    apply: [
        "mixins.shadowed",
        "mixins.bordered",
    ],
    backgroundColor: "#fff",
    borderRadius: "0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    padding: "0.5rem",
});

const separatorClass = css({
    backgroundColor: "primary",
    height: "0.125rem",
    marginTop: "0.125rem",
    marginBottom: "0.125rem",
    // width: "0.125rem",
});

const groups = {
    text: {
        test: "textSize",
        icon: ICONS.TEXT,
        options: {
            textSize: {
                type: "range",
                props: {
                    title: "Text size",
                    domain: [8, 96],
                    step: 4,
                },
            },
            textColor: {
                type: "color",
                props: {
                    title: "Text Color",
                    colors: DARK_COLORS,
                },
            },
            textOpacity: {
                type: "range",
                props: {
                    title: "Text opacity",
                    domain: [0, 1],
                    step: 0.1,
                },
            },
            textAlign: {
                type: "select",
                props: {
                    title: "Text align",
                    values: {
                        [TEXT_ALIGNS.LEFT]: ICONS.TEXT_LEFT,
                        [TEXT_ALIGNS.CENTER]: ICONS.TEXT_CENTER,
                        [TEXT_ALIGNS.RIGHT]: ICONS.TEXT_RIGHT,
                    },
                },
            },
        },
    },
    fill: {
        test: "fillColor",
        icon: ICONS.FILL,
        options: {
            fillColor: {
                type: "color",
                props: {
                    title: "Fill Color",
                    colors: LIGHT_COLORS,
                },
            },
            fillOpacity: {
                type: "range",
                props: {
                    title: "Fill opacity",
                    domain: [0, 1],
                    step: 0.1,
                },
            },
        },
    },
    stroke: {
        test: "strokeWidth",
        icon: ICONS.LINE_HORIZONTAL,
        options: {
            strokeWidth: {
                type: "range",
                props: {
                    title: "Stroke width",
                    domain: [0, 10],
                    step: 1,
                },
            },
            strokeColor: {
                type: "color",
                props: {
                    title: "Stroke color",
                    colors: DARK_COLORS,
                },
            },
            strokeOpacity: {
                type: "range",
                props: {
                    title: "Stroke opacity",
                    domain: [0, 1],
                    step: 0.1
                },
            },
            strokeDash: {
                type: "switch",
                props: {
                    title: "Stroke dash",
                },
            },
        },
    },
    cap: {
        test: "lineStart",
        icon: ICONS.LINE_END_ARROW,
        options: {
            lineStart: {
                type: "select",
                props: {
                    title: "Line start",
                    values: {
                        [LINE_CAPS.NONE]: ICONS.LINE_HORIZONTAL,
                        [LINE_CAPS.ARROW]: ICONS.LINE_START_ARROW,
                        [LINE_CAPS.CIRCLE]: ICONS.LINE_START_CIRCLE,
                        [LINE_CAPS.SQUARE]: ICONS.LINE_START_SQUARE,
                    },
                },
            },
            lineEnd: {
                type: "select",
                props: {
                    title: "Line end",
                    values: {
                        [LINE_CAPS.NONE]: ICONS.LINE_HORIZONTAL,
                        [LINE_CAPS.ARROW]: ICONS.LINE_END_ARROW,
                        [LINE_CAPS.CIRCLE]: ICONS.LINE_END_CIRCLE,
                        [LINE_CAPS.SQUARE]: ICONS.LINE_END_SQUARE
                    },
                },
            },
        },
    },
    radius: {
        test: "radius",
        icon: ICONS.CORNERS,
        options: {
            radius: {
                type: "range",
                props: {
                    title: "Radius",
                    domain: [0, 50],
                    step: 2,
                },
            },
        },
    },
};

const isGroupSelectionVisible = selection => {
    const selectedGroups = new Set(selection.map(el => el.group));
    return selection.length > 1 && (selectedGroups.size > 1 || selectedGroups.has(null));
};

const isUngroupSelectionVisible = selection => {
    return selection.length > 0 && selection.some(el => !!el.group);
};

export const Stylebar = props => {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    const [currentOption, setCurrentOption] = React.useState("");
    const [visibleGroups] = React.useState(() => {
        const element = props.selection.length === 1 ? props.selection[0] : {};
        return Object.fromEntries(Object.keys(groups).map(key => {
            return [key, typeof element[groups[key].test] !== "undefined"];
        }));
    });
    const hasGroupVisible = Object.keys(visibleGroups).some(key => visibleGroups[key]);
    const hasActiveGroup = !!props.activeGroup;
    const handleOptionChange = option => {
        setCurrentOption(option === currentOption ? "" : option);
    };
    const handleChange = (name, value) => {
        props.onChange(name, value);
        forceUpdate();
    };
    const classList = classNames({
        [stylebarWrapperClass]: true,
        "is-visible": props.selection.length > 0,
    });
    return (
        <div className={classList} style={{zIndex:100}}>
            <div className={stylebarClass}>
                {Object.keys(groups).map(key => {
                    if (!visibleGroups[key]) {
                        return null; // This group is not available
                    }
                    const isActive = currentOption === key;
                    const availableOptions = Object.keys(groups[key].options).filter(name => {
                        return typeof props.selection?.[0]?.[name] !== "undefined";
                    });
                    return (
                        <div key={key}>
                            <Button
                                icon={groups[key].icon}
                                active={isActive}
                                onClick={() => handleOptionChange(key)}
                            />
                            <Dialog
                                active={isActive}
                                style={{
                                    top: "0px",
                                    right: "100%",
                                    marginRight: "0.25rem",
                                }}
                            >
                                {availableOptions.map(name => (
                                    <Option
                                        {...groups[key].options[name].props}
                                        key={name}
                                        type={groups[key].options[name].type}
                                        value={props.selection[0][name]}
                                        onChange={v => handleChange(name, v)}
                                    />
                                ))}
                            </Dialog>
                        </div>
                    );
                })}
                {hasGroupVisible && (
                    <div className={separatorClass} />
                )}
                {/* Order buttons
                <{false && (
                    <React.Fragment>
                        <Button
                            icon="bring-forward"
                            onClick={props.onBringForwardClick}
                        />
                        <Button
                            icon="send-backward"
                            onClick={props.onSendBackwardClick}
                        />
                    </React.Fragment>
                )}
                */}
                {/* Group selection */}
                {!hasActiveGroup && isGroupSelectionVisible(props.selection) && (
                    <Button
                        icon={ICONS.OBJECT_GROUP}
                        onClick={props.onGroupSelectionClick}
                    />
                )}
                {/* Ungroup selection */}
                {!hasActiveGroup && isUngroupSelectionVisible(props.selection) && (
                    <Button
                        icon={ICONS.OBJECT_UNGROUP}
                        onClick={props.onUngroupSelectionClick}
                    />
                )}
                {/* Remove current selection */}
                <Button
                    icon={ICONS.TRASH}
                    onClick={props.onRemoveClick}
                />
            </div>
        </div>
    );
};
