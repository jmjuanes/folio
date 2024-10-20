import React from "react";
import {FIELDS} from "../../constants.js";
import {renderElement} from "./index.jsx";
import {useLibraryItem} from "../../contexts/library-items.jsx";

// @description library item component
export const LibraryItemElement = props => {
    const libraryItem = useLibraryItem(props[FIELDS.LIBRARY_ITEM_ID]);
    const x = props.x1 - (props.creating ? libraryItem.width / 2 : 0);
    const y = props.y1 - (props.creating ? libraryItem.height / 2 : 0);
    const opacity = props.creating ? "0.7" : props.opacity;
    return (
        <g transform={`translate(${x},${y})`} opacity={opacity}>
            {libraryItem.elements.map(element => {
                return renderElement(element, element);
            })}
            {!props.creating && (
                <rect
                    data-element={props.id}
                    x="0"
                    y="0"
                    width={libraryItem.width}
                    height={libraryItem.height}
                    fill="transparent"
                    stroke="none"
                    onPointerDown={props.onPointerDown}
                />
            )}
        </g>
    );
};
