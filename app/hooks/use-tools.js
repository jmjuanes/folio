import React from "react";
import {fileOpen} from "browser-fs-access";
import {
    ELEMENTS,
    TOOLS,
    FIELDS,
    SHAPES,
    ARROW_SHAPES,
    STICKERS,
    ARROWHEADS,
    STROKE_WIDTHS,
    FORM_OPTIONS,
} from "../constants.js";
import {STROKE_COLOR_PICK, TEXT_COLOR_PICK} from "../utils/colors.js";
import {
    ArrowIcon,
    ArrowConnectorIcon,
    WidthLargeIcon,
    WidthSmallIcon,
} from "../components/icons.jsx";
import {useEditor} from "../contexts/editor.jsx";
import {getStickerImage} from "../stickers.js";
import {blobToDataUrl} from "../utils/blob.js";

// @description use tools list
export const useTools = () => {
    const editor = useEditor();

    return React.useMemo(() => ({
        [TOOLS.DRAG]: {
            name: "Drag",
            icon: "hand-grab",
            onSelect: () => {
                editor.state.tool = TOOLS.DRAG;
                editor.update();
            },
        },
        [TOOLS.SELECT]: {
            name: "Select",
            icon: "pointer",
            onSelect: () => {
                editor.state.tool = TOOLS.SELECT;
                editor.update();
            },
        },
        [TOOLS.POINTER]: {
            icon: "laser-pointer",
            name: "Laser Pointer",
            onSelect: () => {
                editor.state.tool = TOOLS.POINTER;
                editor.update();
            },
        },
        [TOOLS.ERASER]: {
            icon: "erase",
            name: "Erase",
            onSelect: () => {
                editor.state.tool = TOOLS.ERASER;
                editor.update();
            },
        },
        [ELEMENTS.SHAPE]: {
            icon: "square",
            name: "Shape",
            quickPicks: {
                [FIELDS.SHAPE]: {
                    type: FORM_OPTIONS.SELECT,
                    className: "flex flex-nowrap w-32 gap-1",
                    values: [
                        {value: SHAPES.RECTANGLE, icon: <SquareIcon />},
                        {value: SHAPES.ELLIPSE, icon: <CircleIcon />},
                        {value: SHAPES.TRIANGLE, icon: <TriangleIcon />},
                    ],
                },
                [FIELDS.STROKE_COLOR]: {
                    type: FORM_OPTIONS.COLOR_SELECT,
                    className: "flex flex-nowrap w-48 gap-1",
                    values: STROKE_COLOR_PICK,
                },
            },
            onSelect: () => {
                editor.state.tool = ELEMENTS.SHAPE;
                editor.update();
            },
        },
        [ELEMENTS.ARROW]: {
            icon: "arrow",
            name: "Arrow",
            quickPicks: {
                // [FIELDS.END_ARROWHEAD]: {
                //     type: FORM_OPTIONS.SELECT,
                //     className: "flex flex-nowrap w-24 gap-1",
                //     isActive: (value, currentValue, data) => {
                //         return data[FIELDS.START_ARROWHEAD] === ARROWHEADS.NONE && value === currentValue;
                //     },
                //     values: [
                //         {value: ARROWHEADS.NONE, icon: <LineIcon />},
                //         {value: ARROWHEADS.ARROW, icon: <ArrowIcon />},
                //     ],
                // },
                [FIELDS.ARROW_SHAPE]: {
                    type: FORM_OPTIONS.SELECT,
                    className: "flex flex-nowrap w-24 gap-1",
                    // isActive: (value, currentValue, data) => {
                    //     return data[FIELDS.START_ARROWHEAD] === ARROWHEADS.NONE && value === currentValue;
                    // },
                    values: [
                        {value: ARROW_SHAPES.LINE, icon: <ArrowIcon />},
                        {value: ARROW_SHAPES.CONNECTOR, icon: <ArrowConnectorIcon />},
                    ],
                },
                [FIELDS.STROKE_WIDTH]: {
                    type: FORM_OPTIONS.SELECT,
                    className: "flex flex-nowrap w-24 gap-1",
                    values: [
                        {value: STROKE_WIDTHS.MEDIUM, icon: <WidthSmallIcon />},
                        {value: STROKE_WIDTHS.XLARGE, icon: <WidthLargeIcon />},
                    ],
                },
                [FIELDS.STROKE_COLOR]: {
                    type: FORM_OPTIONS.COLOR_SELECT,
                    className: "flex flex-nowrap w-48 gap-1",
                    values: STROKE_COLOR_PICK,
                },
            },
            onQuickPickChange: (defaults, field, value) => {
                // Make sure that we remove the start arrowhead value
                if (field === FIELDS.END_ARROWHEAD) {
                    defaults[FIELDS.START_ARROWHEAD] = ARROWHEADS.NONE;
                }
            },
            onSelect: () => {
                editor.state.tool = ELEMENTS.ARROW;
                editor.update();
            },
        },
        [ELEMENTS.TEXT]: {
            icon: "text",
            name: "Text",
            quickPicks: {
                // [FIELDS.TEXT_SIZE]: {
                //     type: FORM_OPTIONS.SELECT,
                //     className: "flex flex-nowrap w-24 gap-1",
                //     values: [
                //         {value: TEXT_SIZES.MEDIUM, icon: <WidthSmallIcon />},
                //         {value: TEXT_SIZES.XLARGE, icon: <WidthLargeIcon />},
                //     ],
                // },
                [FIELDS.TEXT_COLOR]: {
                    type: FORM_OPTIONS.COLOR_SELECT,
                    className: "flex flex-nowrap w-48 gap-1",
                    values: TEXT_COLOR_PICK,
                },
            },
            onSelect: () => {
                editor.state.tool = ELEMENTS.TEXT;
                editor.update();
            },
        },
        [ELEMENTS.DRAW]: {
            icon: "pen",
            name: "Draw",
            quickPicks: {
                [FIELDS.STROKE_WIDTH]: {
                    type: FORM_OPTIONS.SELECT,
                    className: "flex flex-nowrap w-24 gap-1",
                    values: [
                        {value: STROKE_WIDTHS.MEDIUM, icon: <WidthSmallIcon />},
                        {value: STROKE_WIDTHS.XLARGE, icon: <WidthLargeIcon />},
                    ],
                },
                [FIELDS.STROKE_COLOR]: {
                    type: FORM_OPTIONS.COLOR_SELECT,
                    className: "flex flex-nowrap w-48 gap-1",
                    values: STROKE_COLOR_PICK,
                },
            },
            onSelect: () => {
                editor.state.tool = ELEMENTS.TEXT;
                editor.update();
            },
        },
        [ELEMENTS.IMAGE]: {
            icon: "image",
            name: "Image",
            onSelect: () => {
                const options = {
                    description: "Folio Board",
                    extensions: [
                        FILE_EXTENSIONS.PNG,
                        FILE_EXTENSIONS.JPG,
                    ],
                    multiple: false,
                };
                fileOpen(options)
                    .then(blob => blobToDataUrl(blob))
                    .then(data => editor.addImageElement(data))
                    .then(() => {
                        editor.dispatchChange();
                        editor.update();
                    })
                    .catch(error => console.error(error));
            },
        },
        [ELEMENTS.STICKER]: {
            icon: "sticker",
            name: "Sticker",
            quickPicks: {
                [FIELDS.STICKER]: {
                    type: FORM_OPTIONS.IMAGE_SELECT,
                    className: "w-72 grid grid-cols-8 gap-1",
                    values: Object.values(STICKERS).map(stickerName => ({
                        value: stickerName,
                        image: getStickerImage(stickerName),
                    })),
                },
            },
            onSelect: () => {
                editor.state.tool = ELEMENTS.STICKER;
                editor.update();
            },
        },
        [ELEMENTS.NOTE]: {
            name: "Note",
            icon: "note",
            onSelect: () => {
                editor.state.tool = ELEMENTS.NOTE;
                editor.update();
            },
        },
    }), []);
};
