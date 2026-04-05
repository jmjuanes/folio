import React from "react";
import { SvgContainer } from "./svg.tsx";
import { NONE, SNAPS_STROKE_COLOR, SNAPS_STROKE_WIDTH } from "../constants.js";
import { useEditor } from "../contexts/editor.tsx";

export type SnapsProps = {
    fillColor?: string;
    strokeWidth?: number;
    strokeColor?: string;
    strokeDasharray?: string;
    strokeLinecap?: "butt" | "round" | "square";
    strokeLinejoin?: "miter" | "round" | "bevel";
};

export const Snaps = (props: SnapsProps): React.JSX.Element => {
    const editor = useEditor();
    const snaps = editor.getSnaps() || [];
    return (
        <SvgContainer>
            {snaps.map((item: any, index: number) => {
                const xItems = item.points.map((p: any) => p[0]);
                const yItems = item.points.map((p: any) => p[1]);
                const start = [Math.min(...xItems), Math.min(...yItems)];
                const end = [Math.max(...xItems), Math.max(...yItems)];
                return (
                    <path
                        key={`snap:edge:${item.edge}.${index}`}
                        d={`M${start.join(",")}L${end.join(",")}`}
                        fill={props.fillColor || NONE}
                        stroke={props.strokeColor || SNAPS_STROKE_COLOR}
                        strokeWidth={props.strokeWidth || SNAPS_STROKE_WIDTH}
                        strokeLinecap={props.strokeLinecap || "round"}
                        strokeLinejoin={props.strokeLinejoin || "round"}
                        strokeDasharray={props.strokeDasharray || ""}
                    />
                );
            })}
        </SvgContainer>
    );
};
