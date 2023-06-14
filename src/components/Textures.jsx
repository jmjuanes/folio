import React from "react";
import {TEXTURES, CANVAS_ROLES} from "../constants.js";

export const Textures = React.memo(props => (
    <defs data-id={props.id} data-role={CANVAS_ROLES.TEXTURES}>
        {/* Pencil texture */}
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id={TEXTURES.PENCIL}>
            <feTurbulence type="fractalNoise" baseFrequency="2" numOctaves="5" stitchTiles="stitch" result="t1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 -1 1" result="t2" />
            <feComposite operator="in" in2="t2" in="SourceGraphic" result="SourceTextured" />
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="5" seed="1" result="f1" />
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="5" seed="5" result="f2" />
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="5" seed="5" result="f3" />
            <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="5" in="SourceTextured" in2="f1" result="f4" />
            <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="5" in="SourceTextured" in2="f2" result="f5" />
            <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="5" in="SourceTextured" in2="f3" result="f6" />
            <feBlend mode="multiply" in="f4" in2="f5" result="out1" />
            <feBlend mode="multiply" in="out1" in2="f6" result="out2" />
        </filter>
    </defs>
));
