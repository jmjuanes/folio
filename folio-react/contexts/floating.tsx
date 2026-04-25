import { createContext, useContext, useState, useCallback, Fragment } from "react";
import type { JSX, ElementType, PropsWithChildren } from "react";

type FloatingElement = {
    id: string;
    component: ElementType,
    context: any,
};

export type FloatingManager = {
    elements: FloatingElement[];
    showElement: (id: string, component: ElementType, context?: any) => void;
    removeElement: (id: string) => void;
};

export type FloatingElementManager = {
    getContext: () => any;
    remove: () => void;
};

// @description surface context
export const FloatingContext = createContext<FloatingManager | null>(null);
export const FloatingElementContext = createContext<FloatingElementManager | null>(null);

// @description hook to access to floating manager
// @returns {object} floating object
// @returns {function} floating.showFloatingElement function to show a floating element
// @returns {function} surface.removeFloatingElement function to remove a floating element
export const useFloating = (): FloatingManager => {
    const floatingManager = useContext(FloatingContext);
    if (!floatingManager) {
        throw new Error("Cannot call 'useFloating' outside FloatingProvider");
    }
    return floatingManager;
};

// @description floating provider component
// @param {object} props React props
// @param {React Children} props.children React children to render
export const FloatingProvider = (props: PropsWithChildren): JSX.Element => {
    const [elements, setElements] = useState<FloatingElement[]>([] as FloatingElement[]);

    // callback to show content in the surface
    // @param {function} render function to render the surface content
    const showElement = useCallback((id: string, component: React.ElementType, context?: any) => {
        setElements((prevElements: FloatingElement[]) => {
            return [
                ...prevElements,
                { id, component, context: context || {} } as FloatingElement,
            ];
        });
    }, [setElements]);

    // callback to remove the provided floating element
    const removeElement = useCallback((id: string) => {
        setElements((prevElements: FloatingElement[]) => {
            return prevElements.filter(element => element.id !== id);
        });
    }, [setElements]);

    return (
        <FloatingContext.Provider value={{ elements, showElement, removeElement }}>
            {props.children}
        </FloatingContext.Provider>
    );
};

// hook to access to the manager for the floating element
export const useFloatingElement = (): FloatingElementManager => {
    const floatingElementManager = useContext(FloatingElementContext);
    if (!floatingElementManager) {
        throw new Error("Cannot call 'useFloatingElement' outside FloatingProvider");
    }
    return floatingElementManager;
};

// internal wrapper to access to managers for the floating elements
const FloatingElementWrapper = (props: { element: FloatingElement }): JSX.Element => {
    const { removeElement } = useFloating();
    const Component: ElementType = props.element.component;
    const getContext = useCallback(() => props.element.context || {}, [props.element.id]);
    const remove = useCallback(() => {
        removeElement(props.element.id);
    }, [removeElement ,props.element.id]);
    return (
        <FloatingElementContext.Provider value={{ getContext, remove }}>
            <Component />
        </FloatingElementContext.Provider>
    );
};

// export component to render content of the floating elements
export const FloatingSlot = (): JSX.Element => {
    const { elements } = useFloating();
    return (
        <Fragment>
            {elements.map((element: FloatingElement, index: number) => {
                return (
                    <FloatingElementWrapper
                        key={`floating:${index}:${element.id}`}
                        element={element}
                    />
                );
            })}
        </Fragment>
    );
};
