import React from "react";
import {
    ELEMENTS,
    FIELDS,
    TOOLS,
    OBJECT_DIMENSIONS_FILL_COLOR,
    OBJECT_DIMENSIONS_TEXT_COLOR,
    OBJECT_DIMENSIONS_TEXT_SIZE,
} from "../../constants.js";
import { useEditor } from "../../contexts/editor.jsx";
import {
    getElementSize,
    getElementsBoundingRectangle,
} from "../../lib/elements.js";
import { getRectangle } from "../../utils/math.ts";

export type DimensionLabel = {
    value: string; // label to be displayed in the dimension badge
    x: number;     // x position of the dimension badge
    y: number;     // y position of the dimension badge
};

const generateDimensionLabel = (elements: any[] = []): DimensionLabel => {
    const rectangle = getElementsBoundingRectangle(elements);
    return {
        value: [
            Math.floor(Math.abs(rectangle[1][0] - rectangle[0][0])),
            Math.floor(Math.abs(rectangle[0][1] - rectangle[1][1])),
        ].join(" x "),
        x: Math.max(...rectangle.map(p => p[0])),
        y: Math.max(...rectangle.map(p => p[1])),
    };
};

const getBottomRightPoint = (points: number[][]): number[] => {
    return points.reduce((best, current) => {
        return (current[1] > best[1] || (current[1] === best[1] && current[0] > best[0])) ? current : best;
    }, points[0]);
};

export const useDimensions = () => {
    const editor = useEditor();
    const dimensions: DimensionLabel[] = [];
    if (editor?.appState?.objectDimensions) {
        if (editor.state.tool === TOOLS.SELECT) {
            const selectedElements = editor.getSelection();
            if (selectedElements.length === 1) {
                const el = selectedElements[0];
                if (el.type === ELEMENTS.SHAPE || el.type === ELEMENTS.DRAW || el.type === ELEMENTS.TEXT || el.type === ELEMENTS.IMAGE) {
                    const sizes = getElementSize(el);
                    const rectangle = getRectangle([ el.x1, el.y1 ], [ el.x2, el.y2 ], el.rotation || 0);
                    const bottomRightPoint = getBottomRightPoint(rectangle);
                    dimensions.push({
                        value: `${Math.floor(sizes[0])} x ${Math.floor(sizes[1])}`,
                        x: bottomRightPoint[0],
                        y: bottomRightPoint[1],
                    });
                }
            } else if (selectedElements.length > 1) {
                dimensions.push(generateDimensionLabel(selectedElements));
            }
        } else if (editor.state.tool === ELEMENTS.SHAPE || editor.state.tool === ELEMENTS.TEXT) {
            const el = editor.getElements().find((element: any) => element[FIELDS.CREATING]);
            if (el) {
                dimensions.push(generateDimensionLabel([ el ]));
            }
        }
    }
    return dimensions;
};

type ObjectDimensionsProps = {
    value: string;
    x: number;
    y: number;
    className?: string;
    translateX?: string | number;
    translateY?: string | number;
};

export const ObjectDimensions = (props: ObjectDimensionsProps): React.JSX.Element => {
    const style: React.CSSProperties = {
        color: OBJECT_DIMENSIONS_TEXT_COLOR,
        fontSize: OBJECT_DIMENSIONS_TEXT_SIZE,
        backgroundColor: OBJECT_DIMENSIONS_FILL_COLOR,
        borderRadius: "0.25rem",
        display: "inline-flex",
        lineHeight: "1",
        padding: "0.25rem",
        pointerEvents: "none",
        position: "absolute",
        top: props.y + "px",
        left: props.x + "px",
        textWrap: "nowrap",
        transform: `translate(${props.translateX || "-100%"},${props.translateY || "0.5rem"})`,
        whiteSpace: "nowrap",
        userSelect: "none",
        width: "max-content",
    };
    return (
        <div className={props.className} style={style}>
            <div>{props.value || "-"}</div>
        </div>
    );
};

export const Dimensions = (): React.JSX.Element => {
    const dimensions = useDimensions();
    return (
        <React.Fragment>
            {dimensions.map((item, index) => (
                <ObjectDimensions
                    key={`prop:${index}`}
                    value={item.value}
                    x={item.x}
                    y={item.y}
                />
            ))}
        </React.Fragment>
    );
};
