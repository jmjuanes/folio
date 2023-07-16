import React from "react";

const FILTER = "pencilEffectFilter";
export const PencilEffectContext = React.createContext(false);

// Component for creating the pencil effect
export const PencilEffectFilter = React.memo(() => (
    <defs data-filter={FILTER}>
        {/* Pencil texture */}
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id={FILTER}>
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

// Pencil effect provider
export const PencilEffectProvider = props => {
    return (
        <PencilEffectContext.Provider value={props.active}>
            {props.children}
        </PencilEffectContext.Provider>
    );
};

// Apply pencil effect to the provided children elements if enabled
export const WithPencilEffect = props => {
    const active = React.useContext(PencilEffectContext);
    // If pencil effect is not active, just return the children nodes
    if (active === false) {
        return props.children;
    }
    // Wrap children into a group element with the pencil effect
    return (
        <g filter={`url(#${FILTER})`}>
            {props.children}
        </g>
    );
};

// Export filter node
export const exportPencilEffectSvgFilter = () => {
    return document.querySelector(`defs[data-filter="${FILTER}"] filter`)?.cloneNode?.(true);
};
