import React from "react";
import {fileOpen} from "browser-fs-access";
import {SquareIcon, CircleIcon, TriangleIcon} from "@josemi-icons/react";
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
    FILE_EXTENSIONS,
} from "../constants.js";
import {STROKE_COLOR_PICK, TEXT_COLOR_PICK} from "../utils/colors.js";
import {
    ArrowIcon,
    ArrowConnectorIcon,
    WidthLargeIcon,
    WidthSmallIcon,
} from "../components/icons.jsx";
import {useEditor} from "../contexts/editor.jsx";
import {getStickerImage} from "../lib/stickers.js";
import {blobToDataUrl} from "../utils/blob.js";

// @description use tools list
export const useTools = () => {
    const editor = useEditor();

    return React.useMemo(() => ({
        [TOOLS.DRAG]: {
            name: "Drag",
            icon: "hand-grab",
            toolEnabledOnReadOnly: true,
            primary: true,
            keyboardShortcut: "h",
            onSelect: () => {
                editor.setTool(TOOLS.DRAG);
                editor.update();
            },
        },
        [TOOLS.SELECT]: {
            name: "Select",
            icon: "pointer",
            primary: true,
            keyboardShortcut: "v",
            onSelect: () => {
                editor.setTool(TOOLS.SELECT);
                editor.update();
            },
        },
        [TOOLS.POINTER]: {
            icon: "laser-pointer",
            name: "Laser Pointer",
            toolEnabledOnReadOnly: true,
            keyboardShortcut: "l",
            onSelect: () => {
                editor.setTool(TOOLS.POINTER);
                editor.update();
            },
        },
        [TOOLS.ERASER]: {
            icon: "erase",
            name: "Erase",
            keyboardShortcut: "e",
            onSelect: () => {
                editor.setTool(TOOLS.ERASER);
                editor.update();
            },
        },
        [ELEMENTS.SHAPE]: {
            icon: "square",
            name: "Shape",
            primary: true,
            keyboardShortcut: "s",
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
                editor.setTool(ELEMENTS.SHAPE);
                editor.update();
            },
        },
        [ELEMENTS.ARROW]: {
            icon: "arrow-up-right",
            name: "Arrow",
            primary: true,
            keyboardShortcut: "a",
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
                editor.setTool(ELEMENTS.ARROW);
                editor.update();
            },
        },
        [ELEMENTS.TEXT]: {
            icon: "text",
            name: "Text",
            primary: true,
            keyboardShortcut: "t",
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
                editor.setTool(ELEMENTS.TEXT);
                editor.update();
            },
        },
        [ELEMENTS.DRAW]: {
            icon: "pen",
            name: "Draw",
            primary: true,
            keyboardShortcut: "d",
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
                editor.setTool(ELEMENTS.DRAW);
                editor.update();
            },
        },
        [ELEMENTS.IMAGE]: {
            icon: "image",
            name: "Image",
            keyboardShortcut: "i",
            onSelect: () => {
                // first we have to make sure that no elements have been selected
                editor.getElements().forEach(element => {
                    element.selected = false;
                    element.editing = false;
                });
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
            primary: true,
            keyboardShortcut: "k",
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
                editor.setTool(ELEMENTS.STICKER);
                editor.update();
            },
        },
        [ELEMENTS.NOTE]: {
            name: "Note",
            icon: "note",
            keyboardShortcut: "n",
            onSelect: () => {
                editor.setTool(ELEMENTS.NOTE);
                editor.update();
            },
        },
    }), []);
};
