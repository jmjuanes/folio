import React from "react";

const PENCIL_FILTER = "pencilEffect";

const PencilEffectContext = React.memo(props => (
    <defs data-filter={PENCIL_FILTER}>
        {/* Pencil texture */}
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id={PENCIL_FILTER}>
            <feColorMatrix
                type="matrix"
                values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 -0.25 1"
                result="Matrix"
            />
            <feComposite
                operator="in"
                in="SourceGraphic"
                in2="Matrix"
                result="SourceTexture"
            />
            <feTurbulence
                type="fractalNoise"
                baseFrequency="0.05"
                numOctaves="5"
                seed="1"
                result="Noise1"
            />
            <feTurbulence
                type="fractalNoise"
                baseFrequency="0.05"
                numOctaves="5"
                seed="5"
                result="Noise2"
            />
            <feDisplacementMap
                xChannelSelector="R"
                yChannelSelector="G"
                scale="5"
                in="SourceTexture"
                in2="Noise1"
                result="Pencil1"
            />
            <feDisplacementMap
                xChannelSelector="R"
                yChannelSelector="G"
                scale="5"
                in="SourceTexture"
                in2="Noise2"
                result="Pencil2"
            />
            <feBlend
                mode="multiply"
                in="Pencil1"
                in2="Pencil2"
                result="Out"
            />
        </filter>
    </defs>
));

const WithPencilEffect = props => (
    <g filter={`url(#${PENCIL_FILTER})`}>
        {props.children}
    </g>
);

export const usePencilEffect = () => {
    return {PencilEffectContext, WithPencilEffect};
};

export const exportPencilEffectSvgFilter = () => {
    return document.querySelector(`defs[data-filter="${PENCIL_FILTER}"] filter`)?.cloneNode?.(true);
};
