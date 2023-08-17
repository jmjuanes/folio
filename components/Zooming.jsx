import React from "react";
import classNames from "classnames";

import {ZOOM_MIN, ZOOM_MAX} from "../constants.js";
import {useBoard} from "../contexts/BoardContext.jsx";
import {SecondaryButton} from "./Button.jsx";
import {ZoomInIcon, ZoomOutIcon} from "./Icons.jsx";

// Zooming panel component
export const Zooming = props => {
    const board = useBoard();
    return (
        <div className="flex gap-0 items-center justify-center">
            <SecondaryButton
                icon={(<ZoomOutIcon />)}
                disabled={board.zoom <= ZOOM_MIN}
                style={{
                    borderTopRightRadius: "0px",
                    borderBottomRightRadius: "0px",
                }}
                onClick={props.onZoomOutClick}
            />
            <div className="flex items-center justify-center w-16 h-full select-none bg-white border-t border-b border-gray-300">
                <span className="text-xs text-center">
                    {(board.zoom * 100).toFixed(0)}%
                </span>
            </div>
            <SecondaryButton
                icon={(<ZoomInIcon />)}
                disabled={ZOOM_MAX <= board.zoom}
                style={{
                    borderTopLeftRadius: "0px",
                    borderBottomLeftRadius: "0px",
                }}
                onClick={props.onZoomInClick}
            />
        </div>
    );
};

Zooming.defaultProps = {
    className: "",
    style: {},
    onZoomInClick: null,
    onZoomOutClick: null,
};
