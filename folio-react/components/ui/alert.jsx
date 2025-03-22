import React from "react";
// import {themed} from "../../contexts/theme.jsx";
import {renderIcon} from "@josemi-icons/react";

export const Alert = props => {
    // const alertClassName = themed({});
    return (
        <div className="rounded-xl shadow-sm border border-yellow-200 bg-yellow-100 text-yellow-900 p-2 flex gap-2 items-center">
            {props.icon && (
                <div className="flex items-center p-0">
                    {renderIcon(props.icon)}
                </div>
            )}
            <div className="text-sm">{props.children || props.text}</div>
        </div>
    );
};
