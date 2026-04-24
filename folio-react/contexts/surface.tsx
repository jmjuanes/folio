import { createContext, useContext, useState, useCallback, Fragment } from "react";
import type { JSX, ElementType, PropsWithChildren } from "react";

type SurfaceEntry ={
    id: string;
    component: ElementType,
    context: any,
};

export type SurfaceManager = {
    surface: SurfaceEntry[];
    showInSurface: (id: string, component: ElementType, context?: any) => void;
    removeFromSurface: (id: string) => void;
    clearSurface: () => void;
};

export type FloatingManager = {
    getContext: () => any;
    close: () => void;
};

// @description surface context
export const SurfaceContext = createContext<SurfaceManager | null>(null);
export const FloatingContext = createContext<SurfaceEntry | null>(null);

// @description hook to access to surface
// @returns {object} surface object
// @returns {function} surface.showSurface function to show a component in the surface
// @returns {function} surface.clearSurface function to clear all components in the surface
export const useSurface = (): SurfaceManager => {
    const surfaceManager = useContext(SurfaceContext);
    if (!surfaceManager) {
        throw new Error("Cannot call 'useSurface' outside SurfaceProvider");
    }
    return surfaceManager;
};

// @description surface provider component
// @param {object} props React props
// @param {React Children} props.children React children to render
export const SurfaceProvider = (props: PropsWithChildren): JSX.Element => {
    const [surface, setSurface] = useState<SurfaceEntry[]>([] as SurfaceEntry[]);

    // callback to show content in the surface
    // @param {function} render function to render the surface content
    const showInSurface = useCallback((id: string, component: React.ElementType, context?: any) => {
        setSurface((prevSurface) => {
            return [
                ...prevSurface,
                { id, component, context: context || {} } as SurfaceEntry,
            ];
        });
    }, [setSurface]);

    // callback to remove the provided component from the surface
    const removeFromSurface = useCallback((id: string) => {
        setSurface((prevSurface) => {
            return prevSurface.filter(surfaceEntry => surfaceEntry.id !== id);
        });
    }, [setSurface]);

    // callback to clear all elements in the surface
    const clearSurface = useCallback(() => {
        setSurface([] as SurfaceEntry[]);
    }, [setSurface]);

    return (
        <SurfaceContext.Provider value={{ surface, showInSurface, removeFromSurface, clearSurface }}>
            {props.children}
        </SurfaceContext.Provider>
    );
};

// hook to access to the manager for the floating element
export const useFloating = (): FloatingManager => {
    const { removeFromSurface } = useSurface();
    const surfaceFloatingContext = useContext(FloatingContext);

    // method to access to the context of the floating element
    const getContext = useCallback(() => {
        return surfaceFloatingContext?.context || {};
    }, [surfaceFloatingContext]);

    // method to close the floating element
    const close = useCallback(() => {
        removeFromSurface(surfaceFloatingContext?.id || "");
    }, [removeFromSurface, surfaceFloatingContext?.id]);

    return { getContext, close };
};

// export component to render content of the surface
export const SurfaceSlot = (): JSX.Element => {
    const { surface } = useSurface();
    return (
        <Fragment>
            {surface.map((surfaceItem: SurfaceEntry, index: number) => {
                const Component: ElementType = surfaceItem.component;
                return (
                    <Fragment key={`surface:${index}:${surfaceItem.id}`}>
                        <FloatingContext.Provider value={surfaceItem}>
                            <Component />
                        </FloatingContext.Provider>
                    </Fragment>
                );
            })}
        </Fragment>
    );
};
