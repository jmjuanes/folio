import React from "react";
import {FIELDS, STICKER_WIDTH, STICKER_HEIGHT} from "../../constants.js";
import {getStickerImage} from "../../stickers.js";

export const StickerElement = props => {
    const x = props.creating ? (props.x1 - STICKER_WIDTH / 2) : Math.min(props.x1, props.x2);
    const y = props.creating ? (props.y1 - STICKER_HEIGHT / 2) : Math.min(props.y1, props.y2);
    return (
        <g opacity={props.opacity}>
            <image
                data-element={props.id}
                x={x}
                y={y}
                width={STICKER_WIDTH}
                height={STICKER_HEIGHT}
                href={getStickerImage(props[FIELDS.STICKER])}
                onPointerDown={props.onPointerDown}
                onDoubleClick={props.onDoubleClick}
            />
        </g>
    );
};
