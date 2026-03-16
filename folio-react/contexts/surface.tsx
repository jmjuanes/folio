import React from "react";
import { createPortal } from "react-dom";

export type SurfaceRenderer = () => React.JSX.Element;

export type SurfaceManager = {
    showSurface: (id: string, render: SurfaceRenderer) => void;
    clearSurface: () => void;
};

export type SurfaceProviderProps = {
    children: React.ReactNode;
};

type SurfaceProviderState = null | {
    render: SurfaceRenderer;
    key: string;
};

// @description surface context
export const SurfaceContext = React.createContext<SurfaceManager | null>(null);

// @description hook to access to surface
// @returns {object} surface object
// @returns {function} surface.showSurface function to show a surface
// @returns {function} surface.hideSurface function to hide the surface
export const useSurface = (): SurfaceManager => {
    const surfaceManager = React.useContext(SurfaceContext);
    if (!surfaceManager) {
        throw new Error("Cannot call 'useSurface' outside SurfaceProvider");
    }
    return surfaceManager;
};

// @description surface provider component
// @param {object} props React props
// @param {React Children} props.children React children to render
export const SurfaceProvider = (props: SurfaceProviderProps): React.JSX.Element => {
    const [activeSurface, setActiveSurface] = React.useState<SurfaceProviderState>(null);

    // callback to show content in the surface
    // @param {function} render function to render the surface content
    const showSurface = React.useCallback((surfaceId: string, surfaceRender: SurfaceRenderer) => {
        if (surfaceId && typeof surfaceRender === "function") {
            setActiveSurface({ key: surfaceId, render: surfaceRender });
        }
    }, [setActiveSurface]);

    // callback to hide the surface
    const clearSurface = React.useCallback(() => {
        setActiveSurface(null);
    }, [setActiveSurface]);

    // register an effect to listen for the escape key
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !!activeSurface) {
                clearSurface();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [activeSurface, clearSurface]);

    return (
        <SurfaceContext.Provider value={{ showSurface, clearSurface }}>
            {props.children}
            {!!activeSurface && createPortal([
                <React.Fragment key={`surface:${activeSurface.key}`}>
                    {activeSurface.render()}
                </React.Fragment>,
            ], document.body)}
        </SurfaceContext.Provider>
    );
};
