import React from "react";

import {Button} from "./Button.js";
import ICONS from "../icons.js";

export const Historybar = props => (
    <div className="position-absolute bottom-0 left-0 pb-4 pl-4 z-50">
        <div className="bg-white radius-md b-dark b-solid b-1 d-flex p-2">
            <Button
                icon={ICONS.UNDO}
                disabled={!!props.undoDisabled}
                onClick={props.onUndoClick}
            />
            <Button
                icon={ICONS.REDO}
                disabled={!!props.redoDisabled}
                onClick={props.onRedoClick}
            />
        </div>
    </div>
);
