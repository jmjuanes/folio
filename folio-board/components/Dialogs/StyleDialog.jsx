import React from "react";
import classNames from "classnames";

import {
    COLOR_KEYS,
    FONT_KEYS,
    OPACITY_KEYS,
    SIZE_KEYS,
    DASH_KEYS,
} from "../../constants.js";
import {
    fillColors,
    strokeColors,
    strokeWidths,
    fontFaces,
    fontSizes,
} from "../../styles.js";
import {Dialog} from "./Dialog.jsx";
import {Form} from "../Form/index.jsx";
import {
    TextIcon,
    FillIcon,
    StrokeIcon,
    OpacityNoneIcon,
    OpacitySemiTransparentIcon,
    OpacityTransparentIcon,
    CircleSolidIcon,
    CircleDashedIcon,
    CircleDottedIcon,
} from "../icons/index.jsx";

const options = {
    fill: {
        icon: FillIcon(),
        test: "fillColor",
        fields: {
            fillColor: {
                type: "color",
                title: "Fill Color",
                values: Object.keys(COLOR_KEYS).map(key => ({
                    value: key,
                    color: fillColors[key],
                })),
            },
            fillOpacity: {
                type: "select",
                title: "Fill Opacity",
                values: [
                    {value: OPACITY_KEYS.NONE, icon: OpacityNoneIcon()},
                    {value: OPACITY_KEYS.SEMITRANSPARENT, icon: OpacitySemiTransparentIcon()},
                    {value: OPACITY_KEYS.TRANSPARENT, icon: OpacityTransparentIcon()},
                ],
            },
        },
    },
    stroke: {
        icon: StrokeIcon(),
        test: "strokeColor",
        fields: {
            strokeColor: {
                type: "color",
                title: "Stroke color",
                values: Object.keys(COLOR_KEYS).map(key => ({
                    value: key,
                    color: strokeColors[key],
                })),
            },
            strokeWidth: {
                type: "select",
                title: "Stroke Width",
                values: [
                    {value: SIZE_KEYS.SMALL, text: "S"},
                    {value: SIZE_KEYS.MEDIUM, text: "M"},
                    {value: SIZE_KEYS.LARGE, text: "L"},
                    {value: SIZE_KEYS.XLARGE, text: "XL"},
                ],
            },
            strokeStyle: {
                type: "select",
                title: "Stroke Style",
                values: [
                    {value: DASH_KEYS.SOLID, icon: CircleSolidIcon()},
                    {value: DASH_KEYS.DASHED, icon: CircleDashedIcon()},
                    {value: DASH_KEYS.DOTTED, icon: CircleDottedIcon()},
                ],
            },
            strokeOpacity: {
                type: "select",
                title: "Stroke Opacity",
                values: [
                    {value: OPACITY_KEYS.NONE, icon: OpacityNoneIcon()},
                    {value: OPACITY_KEYS.SEMITRANSPARENT, icon: OpacitySemiTransparentIcon()},
                    {value: OPACITY_KEYS.TRANSPARENT, icon: OpacityTransparentIcon()},
                ],
            },
        },
    },
    text: {
        icon: TextIcon(),
        test: "textColor",
        fields: {
            textColor: {
                type: "color",
                title: "Text Color",
                values: Object.keys(COLOR_KEYS).map(key => ({
                    value: key,
                    // color: textColors[key],
                    color: strokeColors[key],
                })),
            },
            textFont: {
                type: "font",
                title: "Text Font",
                values: [
                    {value: FONT_KEYS.SANS, font: fontFaces[FONT_KEYS.SANS]},
                    {value: FONT_KEYS.SERIF, font: fontFaces[FONT_KEYS.SERIF]},
                    // {value: FONT_KEYS.SANS, font: fontFaces[FONT_KEYS.SANS]},
                    {value: FONT_KEYS.MONO, font: fontFaces[FONT_KEYS.MONO]},
                ],
            },
            textSize: {
                type: "select",
                title: "Text Size",
                values: [
                    {value: SIZE_KEYS.SMALL, text: "S"},
                    {value: SIZE_KEYS.MEDIUM, text: "M"},
                    {value: SIZE_KEYS.LARGE, text: "L"},
                    {value: SIZE_KEYS.XLARGE, text: "XL"},
                ],
            },
        },
    },
};

const getActiveTab = (values, currentTab) => {
    if (typeof values[options[currentTab].test] !== "undefined") {
        return currentTab;
    }
    // Find the first tab with valid values
    return Object.keys(options).find(tab => {
        return typeof values[options[tab].test] !== "undefined";
    });
};

const useValues = props => {
    if (props.elements.length === 1) {
        return props.elements[0];
    }
    // TODO: we need to compute common values for all elements
    return props.values || {};
};

export const StyleDialog = props => {
    const values = useValues(props);
    const [currentTab, setCurrentTab] = React.useState("fill");
    const hasTextOption = checkHasTextOption(props);
    const activeTab = getActiveTab(values, currentTab);

    return (
        <Dialog className="pt-4 right-0 top-0 pr-24" style={{paddingRight:"5rem"}}>
            <div className="d-flex gap-1 mb-4 b-solid b-1 b-gray-900 p-1 r-lg">
                {Object.keys(options).map(tab => {
                    const isDisabled = typeof values[options[tab].test] === "undefined";
                    const isActive = tab === activeTab;
                    const tabClass = classNames({
                        "d-flex items-center justify-center w-full r-md p-2 text-lg": true,
                        "bg-gray-900 text-white": isActive && !isDisabled,
                        "cursor-pointer text-gray-900 hover:bg-gray-900 hover:text-white": !isActive && !isDisabled,
                        "cursor-not-allowed text-gray-600": isDisabled,
                    });
                    const handleTabClick = () => {
                        if (!isDisabled && !isActive) {
                            setCurrentTab(tab);
                        }
                    };
                    return (
                        <div key={tab} className={tabClass} onClick={handleTabClick}>
                            {options[tab].icon}
                        </div>
                    );
                })}
            </div>
            <Form
                data={props.values || {}}
                items={options[activeTab].fields}
                onChange={props.onChange}
            />
        </Dialog>
    );
};

StyleDialog.defaultProps = {
    elements: [],
    values: {},
    onChange: null,
};
