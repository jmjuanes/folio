import React from "react";
import classNames from "classnames";

import {
    COLORS,
    FONTS,
    OPACITY_NONE,
    OPACITY_SEMITRANSPARENT,
    OPACITY_TRANSPARENT,
    STROKE_SIZE_NONE,
    STROKE_SIZE_SM,
    STROKE_SIZE_MD,
    STROKE_SIZE_LG,
    STROKE_SIZE_XL,
    RADIUS_NONE,
    RADIUS_MD,
    RADIUS_SM,
    RADIUS_LG,
    RADIUS_XL,
    STROKE_STYLE_SOLID,
    STROKE_STYLE_DOTTED,
    STROKE_STYLE_DASHED,
    FONT_SIZE_SM,
    FONT_SIZE_MD,
    FONT_SIZE_LG,
    FONT_SIZE_XL,
} from "../../constants.js";

import {Dialog} from "./Dialog.jsx";
import {Form} from "../Form/index.jsx";
import {
    TextIcon,
    FillIcon,
    CornersIcon,
    OpacityNoneIcon,
    OpacitySemiTransparentIcon,
    OpacityTransparentIcon,
    BanIcon,
    CircleSolidIcon,
    CircleDashedIcon,
    CircleDottedIcon,
} from "../Icons.jsx";

const tabs = {
    fill: FillIcon(),
    stroke: CornersIcon(),
    radius: CornersIcon(),
    text: TextIcon(),
};

const opacityValues = [
    {value: OPACITY_NONE, icon: OpacityNoneIcon()},
    {value: OPACITY_SEMITRANSPARENT, icon: OpacitySemiTransparentIcon()},
    {value: OPACITY_TRANSPARENT, icon: OpacityTransparentIcon()},
];

const options = {
    fill: {
        fillColor: {
            type: "color",
            title: "Fill Color",
            values: COLORS,
        },
        fillOpacity: {
            type: "select",
            title: "Fill Opacity",
            values: opacityValues,
        },
    },
    stroke: {
        strokeColor: {
            type: "color",
            title: "Stroke color",
            values: COLORS,
        },
        strokeWidth: {
            type: "select",
            title: "Stroke Width",
            values: [
                {value: STROKE_SIZE_NONE, icon: BanIcon()},
                {value: STROKE_SIZE_SM, text: "S"},
                {value: STROKE_SIZE_MD, text: "M"},
                {value: STROKE_SIZE_LG, text: "L"},
                {value: STROKE_SIZE_XL, text: "XL"},
            ],
        },
        strokeStyle: {
            type: "select",
            title: "Stroke Style",
            values: [
                {value: STROKE_STYLE_SOLID, icon: CircleSolidIcon()},
                {value: STROKE_STYLE_DASHED, icon: CircleDashedIcon()},
                {value: STROKE_STYLE_DOTTED, icon: CircleDottedIcon()},
            ],
        },
        strokeOpacity: {
            type: "select",
            title: "Stroke Opacity",
            values: opacityValues,
        },
    },
    radius: {
        radius: {
            type: "select",
            title: "Corners",
            values: [
                {value: RADIUS_NONE, icon: BanIcon()},
                {value: RADIUS_SM, text: "S"},
                {value: RADIUS_MD, text: "M"},
                {value: RADIUS_LG, text: "L"},
                {value: RADIUS_XL, text: "XL"},
            ],
        },
    },
    text: {
        textColor: {
            type: "color",
            title: "Text Color",
            values: COLORS,
        },
        textFont: {
            type: "font",
            title: "Text Font",
            values: FONTS,
        },
        textSize: {
            type: "select",
            title: "Text Size",
            values: [
                {value: FONT_SIZE_SM, text: "S"},
                {value: FONT_SIZE_MD, text: "M"},
                {value: FONT_SIZE_LG, text: "L"},
                {value: FONT_SIZE_XL, text: "XL"},
            ],
        },
    // textAlign: {
    //     type: "select",
    //     props: {
    //         title: "Text align",
    //         values: {
    //             // [TEXT_ALIGNS.LEFT]: ICONS.TEXT_LEFT,
    //             // [TEXT_ALIGNS.CENTER]: ICONS.TEXT_CENTER,
    //             // [TEXT_ALIGNS.RIGHT]: ICONS.TEXT_RIGHT,
    //         },
    //     },
    // },
    },
    // lineStart: {
    //     type: "select",
    //     props: {
    //         title: "Line start",
    //         values: {
    //             // [LINE_CAPS.NONE]: ICONS.LINE_HORIZONTAL,
    //             // [LINE_CAPS.ARROW]: ICONS.LINE_START_ARROW,
    //             // [LINE_CAPS.CIRCLE]: ICONS.LINE_START_CIRCLE,
    //             // [LINE_CAPS.SQUARE]: ICONS.LINE_START_SQUARE,
    //         },
    //     },
    // },
    // lineEnd: {
    //     type: "select",
    //     props: {
    //         title: "Line end",
    //         values: {
    //             // [LINE_CAPS.NONE]: ICONS.LINE_HORIZONTAL,
    //             // [LINE_CAPS.ARROW]: ICONS.LINE_END_ARROW,
    //             // [LINE_CAPS.CIRCLE]: ICONS.LINE_END_CIRCLE,
    //             // [LINE_CAPS.SQUARE]: ICONS.LINE_END_SQUARE
    //         },
    //     },
    // },
    // radius: {
    //     type: "range",
    //     props: {
    //         title: "Radius",
    //         domain: [0, 50],
    //         step: 2,
    //     },
    // },
};

export const StyleDialog = props => {
    const [currentTab, setCurrentTab] = React.useState("fill");
    return (
        <Dialog className="pt-4 right-0 top-0 pr-24" style={{paddingRight:"5rem"}}>
            <div className="d-flex gap-1 mb-4 b-solid b-1 b-gray-900 p-1 r-lg">
                {Object.keys(tabs).map(tab => {
                    const tabClass = classNames({
                        "d-flex items-center justify-center w-full r-md p-2 text-lg": true,
                        "bg-gray-900 text-white": tab === currentTab,
                        "cursor-pointer text-gray-900 hover:bg-gray-900 hover:text-white": tab !== currentTab,
                    });
                    return (
                        <div key={tab} className={tabClass} onClick={() => setCurrentTab(tab)}>
                            {tabs[tab]}
                        </div>
                    );
                })}
            </div>
            <Form
                data={props.values || {}}
                items={options[currentTab]}
                onChange={props.onChange}
            />
        </Dialog>
    );
};

StyleDialog.defaultProps = {
    values: {},
    onChange: null,
};
