import React from "react";
import kofi from "kofi";

import {
    LINE_CAPS,
    TEXT_ALIGNS,
} from "@gitdraw/board/constants.js";

import {Dialog} from "./Dialog.js";
import {Button} from "./Button.js";
import {Option} from "./Option.js";
import colors from "../colors.js";
import ICONS from "../icons.js";

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
                    colors: colors.textColors,
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
                type: "selectIcon",
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
                    colors: colors.fillColors,
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
                    colors: colors.strokeColors,
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
                type: "selectIcon",
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
                type: "selectIcon",
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
    const classList = kofi.classNames({
        "is-absolute has-mr-4 has-mt-4 has-right-none has-top-none": true,
        "is-hidden": props.selection.length === 0,
    });
    return (
        <div className={classList}>
            <div className="has-radius-md has-bg-white is-bordered has-p-2">
                {Object.keys(groups).map(key => {
                    if (!visibleGroups[key]) {
                        return null; // This group is not available
                    }
                    const isActive = currentOption === key;
                    const availableOptions = Object.keys(groups[key].options).filter(name => {
                        return typeof props.selection[0][name] !== "undefined";
                    });
                    return (
                        <div key={key}>
                            <Button
                                className="has-mb-1"
                                icon={groups[key].icon}
                                active={isActive}
                                onClick={() => handleOptionChange(key)}
                            />
                            <Dialog active={isActive} className="has-top-none has-right-none has-mr-16">
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
                {kofi.when(hasGroupVisible, () => (
                    <div className="has-bg-body has-opacity-50 has-my-2" style={{height: "2px"}} />
                ))}
                {/* Order buttons */}
                {kofi.when(false, () => (
                    <React.Fragment>
                        <Button
                            className="has-mb-1"
                            icon="bring-forward"
                            onClick={props.onBringForwardClick}
                        />
                        <Button
                            className="has-mb-1"
                            icon="send-backward"
                            onClick={props.onSendBackwardClick}
                        />
                    </React.Fragment>
                ))}
                {/* Group selection */}
                {kofi.when(!hasActiveGroup && isGroupSelectionVisible(props.selection), () => (
                    <Button
                        className="has-mb-1"
                        icon={ICONS.OBJECT_GROUP}
                        onClick={props.onGroupSelectionClick}
                    />
                ))}
                {/* Ungroup selection */}
                {kofi.when(!hasActiveGroup && isUngroupSelectionVisible(props.selection), () => (
                    <Button
                        className="has-mb-1"
                        icon={ICONS.OBJECT_UNGROUP}
                        onClick={props.onUngroupSelectionClick}
                    />
                ))}
                {/* Remove current selection */}
                <Button
                    icon={ICONS.TRASH}
                    onClick={props.onRemoveClick}
                />
            </div>
        </div>
    );
};
