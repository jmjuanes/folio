import React from "react";
import kofi from "kofi";
import {Dialog} from "./dialog.js";
import {Button} from "./button.js";
import {Option} from "./option.js";

// Pixel format utility
const pixelValueFormat = v => v + "px";

// Line cap types
const lineCapTypes = [
    "none",
    "arrow",
    "square",
    "circle",
];

// Groups options
const groups = {
    text: {
        test: "textSize",
        icon: "font",
        options: {
            textSize: {
                type: "range",
                props: {
                    title: "Text size",
                    domain: [4, 100],
                    format: pixelValueFormat,
                },
            },
            // textColor: {
            //     type: "color",
            //     props: {
            //         title: "Text Color",
            //         // colors: objectValues(config.colors),
            //     },
            // },
            textOpacity: {
                type: "range",
                props: {
                    title: "Text opacity",
                    domain: [0, 1],
                    step: 0.1,
                },
            },
            textContent: {
                type: "text",
                props: {
                    title: "Text content",
                },
            },
        },
    },
    fill: {
        test: "fillColor",
        icon: "fill",
        options: {
            // fillColor: {
            //     type: "color",
            //     props: {
            //         title: "Fill Color",
            //         // colors: objectValues(config.colors),
            //     },
            // },
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
        icon: "minus",
        options: {
            strokeWidth: {
                type: "range",
                props: {
                    title: "Stroke size",
                    domain: [0, 20],
                    step: 1,
                    format: pixelValueFormat,
                },
            },
            // strokeColor: {
            //     type: "color",
            //     props: {
            //         title: "Stroke color",
            //         // colors: objectValues(config.colors),
            //     },
            // },
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
        icon: "pointer",
        options: {
            lineStart: {
                type: "select",
                props: {
                    title: "Line start",
                    values: lineCapTypes,
                },
            },
            lineEnd: {
                type: "select",
                props: {
                    title: "Line end",
                    values: lineCapTypes,
                },
            },
        },
    },
    radius: {
        test: "radius",
        icon: "corner",
        options: {
            radius: {
                type: "range",
                props: {
                    title: "Radius",
                    domain: [0, 50],
                    step: 1,
                },
            },
        },
    },
};

// Stylebar component
export const Stylebar = props => {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    const [currentOption, setCurrentOption] = React.useState("");
    const [visibleGroups] = React.useState(() => {
        const element = props.selection.length === 1 ? props.selection[0] : {};
        return Object.fromEntries(Object.keys(groups).map(key => {
            return [key, typeof element[groups[key].test] !== "undefined"];
        }));
    });
    // Handle option change
    const handleOptionChange = option => {
        setCurrentOption(option === currentOption ? "" : option);
    };
    const handleChange = (name, value) => {
        props.onChange(name, value);
        forceUpdate();
    };
    const handleForward = () => props.onOrderChange("front");
    const handleBackward = () => props.onOrderChange("back");
    const classList = kofi.classNames({
        "is-absolute has-mr-4 has-mt-4 has-right-none has-top-none": true,
        "is-hidden": props.selection.length === 0,
    });
    return (
        <div className={classList}>
            <div className="has-radius-md has-bg-gray-100 has-p-2">
                {Object.keys(groups).map(key => {
                    if (!visibleGroups[key]) {
                        return null; // This group is not available
                    }
                    const isActive = currentOption === key;
                    const availableOptions = Object.keys(groups[key].options);
                    return (
                        <div key={key} className="is-relative">
                            <Button
                                className="has-mb-1"
                                icon={groups[key].icon}
                                active={isActive}
                                onClick={() => handleOptionChange(key)}
                            />
                            <Dialog active={isActive} className="has-top-none has-right-none has-mr-12">
                                {availableOptions.map(name => (
                                    <Option
                                        {...groups[key].options[name].props}
                                        key={name}
                                        type={groups[key].options[name].type}
                                        value={props.selection[0][name]}
                                        theme={props.theme || {}}
                                        onChange={v => handleChange(name, v)}
                                    />
                                ))}
                            </Dialog>
                        </div>
                    );
                })}
                {/* Order buttons */}
                {kofi.when(props.selection.length === 1, () => (
                    <React.Fragment>
                        <Button className="has-mb-1" icon="bring-forward" onClick={handleForward} />
                        <Button className="has-mb-1" icon="send-backward" onClick={handleBackward} />
                    </React.Fragment>
                ))}
                {/* Clone current selection */}
                <Button
                    className="has-mb-1"
                    icon="clone"
                    onClick={props.onClone}
                />
                {/* Remove current selection */}
                <Button
                    className=""
                    icon="trash"
                    onClick={props.onRemove}
                />
            </div>
        </div>
    );
};
