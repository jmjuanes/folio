import { Fragment, createContext, useReducer, useContext, useCallback } from "react";
import type { ElementType, ReactNode, JSX } from "react";

enum WorkbenchActionType {
    OPEN_VIEW = "workbench.action.open_view",
    CLOSE_VIEW = "workbench.action.close_view",
    TOGGLE_VIEW = "workbench.action.toggle_view",
};

export enum Part {
    TITLEBAR = "workbench.parts.titlebar",
    CANVAS = "workbench.parts.canvas",
    SURFACE = "workbench.parts.surface",
    SIDEBAR = "workbench.parts.sidebar",
    STATUSBAR = "workbench.parts.statusbar",
    AUXILIARYBAR = "workbench.parts.auxiliarybar",
};

export type View = {
    part: Part,
    component: ElementType;
    context: any;
};

export type PartsRegistry = Record<Part, View[]>

export type WorkbenchAction = {
    type: WorkbenchActionType;
    part: Part;
    component?: ElementType;
    context?: any;
};

export type WorkbenchManager = {
    parts: PartsRegistry;
    isViewOpen: (part: Part, component: ElementType) => boolean;
    openView: (part: Part, component: ElementType, context?: any) => void;
    closeView: (part: Part, component: ElementType) => void;
    toggleView: (part: Part, component: ElementType, context?: any) => void;
};

export type WorkbenchViewManager = {
    close: () => void;
};

// reducer for workbench parts
const workbenchPartsReducer = (prevParts: PartsRegistry, action: WorkbenchAction): PartsRegistry => {
    const newParts = Object.assign({}, prevParts);
    // make sure that views list of this part is defined
    if (typeof newParts[action.part] === "undefined") {
        newParts[action.part] = [];
    }
    switch (action.type) {
        case WorkbenchActionType.OPEN_VIEW:
            if (action.component) {
                newParts[action.part].push({
                    part: action.part,
                    component: action.component,
                    context: action.context || {},
                });
            }
            break;
        case WorkbenchActionType.CLOSE_VIEW:
            newParts[action.part] = newParts[action.part].filter((view: View) => {
                return view.component !== action.component;
            });
            break;
        case WorkbenchActionType.TOGGLE_VIEW:
            const existsView = newParts[action.part].some((view: View) => {
                return view.component === action.component;
            });
            if (existsView) {
                newParts[action.part] = newParts[action.part].filter((view: View) => {
                    return view.component !== action.component;
                });
            }
            else if (action.component) {
                newParts[action.part].push({
                    part: action.part,
                    component: action.component,
                    context: action.context || {},
                });
            }
            break;
    }
    return newParts;
};

// function to initialize the views in the workbench
const workbenchPartsInitializer = (initialViews: View[]): PartsRegistry => {
    const initialParts = {} as PartsRegistry;
    (initialViews || []).forEach((view: View) => {
        if (typeof initialParts[view.part] === "undefined") {
            initialParts[view.part] = [] as View[];
        }
        // insert this view
        initialParts[view.part].push(view);
    });
    return initialParts;
};

// @description workbench context
export const WorkbenchContext = createContext<WorkbenchManager>({} as WorkbenchManager);
export const WorkbenchViewContext = createContext<View>({} as View);

// @description hook to access to workbench manager
export const useWorkbench = (): WorkbenchManager => {
    return useContext(WorkbenchContext);
};

export type WorkbenchProviderProps = {
    initialViews?: View[];
    children: ReactNode;
};

// @description workbench provider
export const WorkbenchProvider = (props: WorkbenchProviderProps): JSX.Element => {
    const [parts, dispatch] = useReducer(workbenchPartsReducer, props.initialViews || [], workbenchPartsInitializer);

    // 1. method to open a part in the workbench
    const openView = useCallback((part: Part, component: ElementType, context?: any) => {
        dispatch({ type: WorkbenchActionType.OPEN_VIEW, part, component, context });
    }, [dispatch]);

    // 2. method to close a part in the workbench
    const closeView = useCallback((part: Part, component: ElementType) => {
        dispatch({ type: WorkbenchActionType.CLOSE_VIEW, part, component });
    }, [dispatch]);

    // 2. method to toggle a view in the workbench
    const toggleView = useCallback((part: Part, component: ElementType, context?: any) => {
        dispatch({ type: WorkbenchActionType.TOGGLE_VIEW, part, component, context });
    }, [dispatch]);

    // 4. method to check if the provided part is visible in the workbench
    const isViewOpen = useCallback((part: Part, component: ElementType): boolean => {
        return (parts[part] || []).some((view: View) => {
            return view.component === component;
        });
    }, [parts]);

    return (
        <WorkbenchContext.Provider value={{ parts, isViewOpen, openView, closeView, toggleView }}>
            {props.children}
        </WorkbenchContext.Provider>
    );
};

// hook to access to the context of the workbench part
export const useViewContext = (): any => {
    return (useContext(WorkbenchViewContext) as View)?.context || {};
};

// hook to control the view
export const useView = (): WorkbenchViewManager => {
    const workbench = useContext(WorkbenchContext);
    const view = useContext(WorkbenchViewContext);

    const close = useCallback(() => {
        workbench.closeView(view.part, view.component);
    }, [workbench, view]);

    return { close } as WorkbenchViewManager;
};

export type WorkbenchSlotProps = {
    part: Part;
    render?: (content: JSX.Element) => JSX.Element;
};

// @description component to display a specific part of the workbench
export const WorkbenchSlot = (props: WorkbenchSlotProps): JSX.Element | null => {
    const { parts } = useWorkbench();

    // if no visible parts are available
    if (!parts[props.part] || parts[props.part].length === 0) {
        return null;
    }

    // get the content and check if we have to wrap its content into the provided render method
    const content = (
        <Fragment>
            {parts[props.part].map((view: View, index: number) => {
                const Component = view.component as ElementType;
                return (
                    <WorkbenchViewContext.Provider key={index} value={view}>
                        <Component />
                    </WorkbenchViewContext.Provider>
                );
            })}
        </Fragment>
    );
    return props.render ? props.render(content) : content;
};
