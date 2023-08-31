import React from "react";
import {COVER_COLORS, colorShade} from "../utils/colors.js";

export const BoardCover = props => {
    const coverStyle = {
        backgroundColor: props.color,
        borderTopRightRadius: "1rem",
        borderBottomRightRadius: "1rem",
    };
    return (
        <div className="cursor-pointer" onClick={props.onClick}>
            <div className="relative h-32 w-48 shadow-lg overflow-hidden" style={coverStyle}>
                <div
                    data-testid="board-cover-lateral"
                    className="absolute top-0 left-0 w-4 h-32 border-r-2"
                    style={{
                        backgroundColor: colorShade(props.color, -25),
                        borderColor: colorShade(props.color, -28),
                    }}
                />
                <div
                    data-testid="board-cover-band"
                    className="absolute top-0 right-0 mr-6 w-6 h-32 border-l-2 border-r-2"
                    style={{
                        backgroundColor: colorShade(props.color, -15),
                        borderColor: colorShade(props.color, -18),
                    }}
                />
            </div>
        </div>
    );
};

BoardCover.defaultProps = {
    color: COVER_COLORS.charcoal,
    onClick: null,
};
