import React from "react";
import {ImageIcon, renderIcon} from "@josemi-icons/react";
import {TRANSPARENT, NONE, BOOKMARK_WIDTH, BOOKMARK_OFFSET} from "../../constants.js";
import {useAssets} from "../../contexts/assets.jsx";
import {copyTextToClipboard} from "../../utils/clipboard.js";
import {stopEventPropagation} from "../../utils/events.js";

// @private bookmark action button
const BookmarkActionButton = props => (
    <div onPointerDown={props.onPointerDown} className="cursor-pointer flex text-xl p-2 rounded-md border-1 border-gray-200 bg-white hover:bg-gray-100">
        {renderIcon(props.icon)}
    </div>
);

export const BookmarkElement = props => {
    const assets = useAssets();
    const link = assets[props.assetId]?.data || {};
    const width = props.x2 - props.x1;
    const height = props.y2 - props.y1;
    const style = {
        height: height + "px",
        width: width + "px",
        transform: `translateX(${BOOKMARK_OFFSET}px) translateY(${BOOKMARK_OFFSET}px)`,
        pointerEvents: "none",
        opacity: props.opacity,
    };
    return (
        <g>
            <foreignObject
                x={props.x1 - BOOKMARK_OFFSET}
                y={props.y1 - BOOKMARK_OFFSET}
                width={width + (2 * BOOKMARK_OFFSET)}
                height={height + (2 * BOOKMARK_OFFSET)}
            >
                <div className="select-none flex flex-col rounded-md bg-white shadow-sm overflow-hidden border-1 border-gray-200" style={style}>
                    <div className="flex items-center justify-center bg-gray-100 grow">
                        <div className="flex text-5xl text-gray-500">
                            <ImageIcon />
                        </div>
                    </div>
                    <div className="p-3 bg-white">
                        <div className="text-xs w-full truncate">
                            <strong>{link.src}</strong>
                        </div>
                    </div>
                </div>
            </foreignObject>
            <rect
                data-element={props.id}
                x={props.x1}
                y={props.y1}
                width={Math.max(1, width)}
                height={Math.max(1, height)}
                rx="0"
                fill={TRANSPARENT}
                stroke={NONE}
                onPointerDown={props.onPointerDown}
            />
            {props.selected && (
                <foreignObject x={props.x1} y={props.y1 - 50} width={BOOKMARK_WIDTH} height={50}>
                    <div className="flex justify-center gap-2" onPointerDown={stopEventPropagation}>
                        <BookmarkActionButton
                            icon="clipboard"
                            onPointerDown={() => copyTextToClipboard(link.src)}
                        />
                        <a href={link.src} target="_blank" className="flex">
                            <BookmarkActionButton icon="external-link" />
                        </a>
                    </div>
                </foreignObject>
            )}
        </g>
    );
};
