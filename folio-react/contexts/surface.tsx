import React from "react";
// import { createPortal } from "react-dom";

type SurfaceEntry ={
    id: string;
    component: React.ElementType,
    data: any,
};

export type SurfaceManager = {
    surface: SurfaceEntry[];
    showInSurface: (id: string, component: React.ElementType, data?: any) => void;
    removeFromSurface: (id: string) => void;
    clearSurface: () => void;
};

export type SurfaceSlotManager = {
    hideSurfaceSlot: () => void;
};

// @description surface context
export const SurfaceContext = React.createContext<SurfaceManager | null>(null);
export const SurfaceSlotContext = React.createContext<SurfaceEntry | null>(null);

// @description hook to access to surface
// @returns {object} surface object
// @returns {function} surface.showSurface function to show a component in the surface
// @returns {function} surface.clearSurface function to clear all components in the surface
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
export const SurfaceProvider = (props: React.PropsWithChildren): React.JSX.Element => {
    const [surface, setSurface] = React.useState<SurfaceEntry[]>([] as SurfaceEntry[]);

    // callback to show content in the surface
    // @param {function} render function to render the surface content
    const showInSurface = React.useCallback((id: string, component: React.ElementType, data?: any) => {
        setSurface((prevSurface) => {
            return [
                ...prevSurface,
                { id, component, data: data || {} } as SurfaceEntry,
            ];
        });
    }, [setSurface]);

    // callback to remove the provided component from the surface
    const removeFromSurface = React.useCallback((id: string) => {
        setSurface((prevSurface) => {
            return prevSurface.filter(surfaceEntry => surfaceEntry.id !== id);
        });
    }, [setSurface]);

    // callback to clear all elements in the surface
    const clearSurface = React.useCallback(() => {
        setSurface([] as SurfaceEntry[]);
    }, [setSurface]);

    return (
        <SurfaceContext.Provider value={{ surface, showInSurface, removeFromSurface, clearSurface }}>
            {props.children}
        </SurfaceContext.Provider>
    );
};

// @description hook to access to the surface slot context
export const useSurfaceSlotContext = (): SurfaceEntry => {
    const surfaceSlotContext = React.useContext(SurfaceSlotContext);
    if (!surfaceSlotContext) {
        throw new Error("Cannot call 'useSurfaceSlotContext' outside SurfaceProvider");
    }
    return surfaceSlotContext;
};

// @description hook to manage the surface slot
export const useSurfaceSlot = (): SurfaceSlotManager => {
    const { removeFromSurface } = useSurface();
    const surfaceSlotContext = useSurfaceSlotContext();

    // method to hide the surface slot
    const hideSurfaceSlot = React.useCallback(() => {
        removeFromSurface(surfaceSlotContext.id);
    }, [removeFromSurface, surfaceSlotContext?.id]);

    return { hideSurfaceSlot };
};

// @description hook to remove the surface when the user press the ESC key
export const useSurfaceSlotClearWithEscKey = (): void => {
    const { removeFromSurface } = useSurface();
    const { id } = useSurfaceSlotContext();
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !!id) {
                removeFromSurface(id);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [removeFromSurface, id]);
};

// export component to render content of the surface
export const SurfaceSlot = (): React.JSX.Element => {
    const { surface } = useSurface();
    return (
        <React.Fragment>
            {surface.map((surfaceItem: SurfaceEntry, index: number) => {
                const Component = surfaceItem.component;
                return (
                    <React.Fragment key={`surface:${index}:${surfaceItem.id}`}>
                        <SurfaceSlotContext.Provider value={surfaceItem}>
                            <Component />
                        </SurfaceSlotContext.Provider>
                    </React.Fragment>
                );
            })}
        </React.Fragment>
    );
};
