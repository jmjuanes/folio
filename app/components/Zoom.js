import React from "react";

import {Button} from "./Button.js";
import ICONS from "../icons.js";

export const Zoom = props => (
    <div className="bottom-0 right-0 pb-8 pr-8 position-absolute z-10">
        <div className="shadow-md b-1 b-solid b-gray-900 items-center bg-white r-md d-flex p-4 select-none">
            <Button
                icon={ICONS.ZOOM_OUT}
                disabled={!!props.zoomOutDisabled}
                onClick={props.onZoomOutClick}
            />
            <div className="text-sm font-bold o-80 pl-4 pr-4 text-center w-20">
                {(props.zoom * 100).toFixed(0)}%
            </div>
            <Button
                icon={ICONS.ZOOM_IN}
                disabled={!!props.zoomInDisabled}
                onClick={props.onZoomInClick}
            />
        </div>
    </div>
);
