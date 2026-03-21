import React from "react";
import { SvgContainer } from "../../components/svg.tsx";
import { NONE, SNAPS_STROKE_COLOR, SNAPS_STROKE_WIDTH } from "../../constants.js";

export const SnapEdges = (props: { edges: any[] }) => {
    return (
        <SvgContainer>
            {props.edges.map((item: any, index: number) => {
                const xItems = item.points.map((p: any) => p[0]);
                const yItems = item.points.map((p: any) => p[1]);
                const start = [Math.min(...xItems), Math.min(...yItems)];
                const end = [Math.max(...xItems), Math.max(...yItems)];
                return (
                    <path
                        key={`snap:edge:${item.edge}.${index}`}
                        d={`M${start.join(",")}L${end.join(",")}`}
                        fill={NONE}
                        stroke={SNAPS_STROKE_COLOR}
                        strokeWidth={SNAPS_STROKE_WIDTH}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                );
            })}
        </SvgContainer>
    );
};
