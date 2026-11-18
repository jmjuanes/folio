import {
    createElement,
    createContext,
    useContext,
    useState,
    useCallback,
    Fragment,
    useEffect,
} from "react";
import { createPortal } from "react-dom";
import type {
    JSX,
    ElementType,
    PropsWithChildren,
    ComponentType,
    ReactNode,
    CSSProperties,
} from "react";

// @description to generate the composition tree from an array of React components
// @param {array} components An array of React components to build the tree
// @param {ReactNode} children The children content of the tree
const composeTree = (components: ComponentType[], children: ReactNode): JSX.Element => {
    return (components || []).reduceRight((acc, Comp) => createElement(Comp, null, acc), children) as JSX.Element;
};

export type SurfaceElement = {
    id: string;
    component: ElementType;
    context?: any;
    middlewares?: ComponentType[];
};

export type SurfaceManager = {
    open: (id: string, element: Partial<SurfaceElement>) => void;
    close: (id?: string) => void;
    closeAll: () => void;
    getContext: () => any;
};

type SurfaceContextValue = {
    elements: SurfaceElement[];
    setElements: (update: (prev: SurfaceElement[]) => SurfaceElement[]) => void;
};

const SurfaceContext = createContext<SurfaceContextValue | null>(null);
const SurfaceElementContext = createContext<SurfaceElement | null>(null);

// @description hook to access to surface manager
// @returns {object} surface object
// @returns {function} surface.open function to show an surface element
// @returns {function} surface.close function to remove an surface element
export const useSurface = (): SurfaceManager => {
    const context = useContext(SurfaceContext);
    const elementContext = useContext(SurfaceElementContext);
    if (!context) {
        throw new Error("Cannot call 'useSurface' outside SurfaceProvider");
    }

    const { setElements } = context;

    // callback to show an surface element
    const open = useCallback((elementId: string, element: Partial<SurfaceElement>) => {
        // 1. check if the component is provided
        if (!element.component) {
            throw new Error("Cannot display surface element without 'component'");
        }
        setElements((prevElements: SurfaceElement[]) => {
            // 2. check if this element is already registered
            if (prevElements.some((el: SurfaceElement) => el.id === elementId)) {
                throw new Error(`There is a floating element alerady registered with the id '${elementId}'`);
            }
            // 3. register the new elements
            return [
                ...prevElements,
                {
                    ...element,
                    id: elementId,
                    context: element?.context || {},
                } as SurfaceElement,
            ];
        });
    }, [setElements]);

    // callback to remove the provided surface element
    const close = useCallback((elementId?: string) => {
        // 1. if the user is not calling this method with the ID and we are not inside a floating element
        if (!elementId && !elementContext) {
            throw new Error("Cannot call surface.close() without an id outside a floating element");
        }
        // 2. get the element ID to close.
        // If the user has not called this method with an ID, use the current floating element id
        const elementIdToClose = elementId || elementContext?.id;
        setElements((prevElements: SurfaceElement[]) => {
            return prevElements.filter(element => element.id !== elementIdToClose);
        });
    }, [setElements]);

    // callback to clear all surface elements
    const closeAll = useCallback(() => setElements(() => [] as SurfaceElement[]), [setElements]);

    // callback to access to the context of the current element
    // note that this method only works when using useSurface hook inside a floating element
    const getContext = useCallback(() => {
        if (!elementContext) {
            throw new Error("Cannot call 'getContext' outside a floating element.");
        }
        return elementContext?.context || {};
    }, [elementContext]);

    return { open, close, closeAll, getContext };
};

// @description main component
// @param {object} props React props
// @param {React Children} props.children React children to render
export const SurfaceProvider = (props: PropsWithChildren): JSX.Element => {
    const [elements, setElements] = useState<SurfaceElement[]>([] as SurfaceElement[]);
    return (
        <SurfaceContext.Provider value={{ elements, setElements }}>
            {props.children}
        </SurfaceContext.Provider>
    );
};

// internal wrapper to access to managers for the surface elements
const SurfaceElementWrapper = (props: { element: SurfaceElement }): JSX.Element => {
    const Component: ElementType = props.element.component;
    const middlewaresComponents: ComponentType[] = props.element.middlewares || [];
    return (
        <SurfaceElementContext.Provider value={props.element}>
            {composeTree(middlewaresComponents, <Component />)}
        </SurfaceElementContext.Provider>
    );
};

// export component to render content of the surface elements
export const SurfaceOutlet = (): JSX.Element => {
    const context = useContext(SurfaceContext);
    if (!context) {
        throw new Error("Component SurfaceOutlet can not be used outside <SurfaceProvider>");
    }
    const { elements } = context;
    return (
        <Fragment>
            {(elements || []).map((element: SurfaceElement, index: number) => {
                return (
                    <SurfaceElementWrapper
                        key={`surface:${index}:${element.id}`}
                        element={element}
                    />
                );
            })}
        </Fragment>
    );
};

// @description middleware to set a custom position for the floating element
export const withFixedPosition = (
    options: {
        top: number | string;
        left: number | string;
        className?: string;
        style?: CSSProperties;
        testid?: string;
    },
): ComponentType => {
    return (props: PropsWithChildren): JSX.Element => {
        const style: CSSProperties = {
        top: typeof options.top === "number" ? options.top + "px" : options.top,
            left: typeof options.left === "number" ? options.left + "px" : options.left,
            position: "fixed",
            ...options.style,
        };
        return (
            <div data-testid={options.testid} className={options.className} style={style}>
                {props.children}
            </div>
        );
    };
};

// @description middleware to display the floating element in a portal
export const withPortal = (
    options?: {
        key?: string;
        target?: HTMLElement,
    },
): ComponentType => {
    return (props: PropsWithChildren): JSX.Element => {
        return createPortal([
            <Fragment key={options?.key ?? "surface:middleware:portal"}>
                {props.children}
            </Fragment>,
        ], options?.target ?? document.body);
    };
};

// @description middleware to display an overlay with the floating element
export const withOverlay = (
    options?: {
        className?: string;
        style?: CSSProperties;
        testid?: string;
        closeOnClick?: boolean;
    },
): ComponentType => {
    return (props: PropsWithChildren): JSX.Element => {
        const { close } = useSurface();
        return (
            <Fragment>
                <div
                    data-testid={options?.testid}
                    className={options?.className}
                    style={{
                        position: "fixed",
                        width: "100%",
                        height: "100%",
                        top: "0",
                        left: "0",
                        ...options?.style,
                    } as CSSProperties}
                    onClick={() => {
                        if (options?.closeOnClick) {
                            close();
                        }
                    }}
                />
                {props.children}
            </Fragment>
        );
    };
};

// @description middleware to close the floating element when the Escape key is pressed
export const withDismiss = (): ComponentType => {
    return (props: PropsWithChildren): JSX.Element => {
        const { close } = useSurface();
        useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === "Escape") {
                    close();
                }
            };
            document.addEventListener("keydown", handleKeyDown);
            return () => {
                document.removeEventListener("keydown", handleKeyDown);
            };
        }, [close]);
        return (
            <Fragment>{props.children}</Fragment>
        );
    };
};
