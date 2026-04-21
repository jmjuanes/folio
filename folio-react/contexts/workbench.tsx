import React from "react";

enum WorkbenchActionType {
    OPEN_VIEW = "workbench.action.open_view",
    CLOSE_VIEW = "workbench.action.close_view",
    TOGGLE_VIEW = "workbench.action.toggle_view",
};

export enum Part {
    CANVAS = "workbench.parts.canvas",
    SURFACE = "workbench.parts.surface",
    SIDEBAR = "workbench.parts.sidebar",
};

export type View = {
    part: Part,
    component: React.ElementType;
    context: any;
};

export type PartsRegistry = Record<Part, View[]>

export type WorkbenchAction = {
    type: WorkbenchActionType;
    part: Part;
    component?: React.ElementType;
    context?: any;
};

export type WorkbenchManager = {
    parts: PartsRegistry;
    isViewOpen: (part: Part, component: React.ElementType) => boolean;
    openView: (part: Part, component: React.ElementType, context?: any) => void;
    closeView: (part: Part, component: React.ElementType) => void;
    toggleView: (part: Part, component: React.ElementType, context?: any) => void;
};

export type WorkbenchViewManager = {
    close: () => void;
};

// @description workbench context
export const WorkbenchContext = React.createContext<WorkbenchManager>({} as WorkbenchManager);
export const WorkbenchViewContext = React.createContext<View>({} as View);

// @description hook to access to workbench manager
export const useWorkbench = (): WorkbenchManager => {
    return React.useContext(WorkbenchContext);
};

export type WorkbenchProviderProps = {
    initialParts?: PartsRegistry;
    children: React.ReactNode;
};

// @description workbench provider
export const WorkbenchProvider = (props: WorkbenchProviderProps): React.JSX.Element => {
    const [parts, dispatch] = React.useReducer((prevParts: PartsRegistry, action: WorkbenchAction) => {
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
    }, (props.initialParts || {}) as PartsRegistry);

    // 1. method to open a part in the workbench
    const openView = React.useCallback((part: Part, component: React.ElementType, context?: any) => {
        dispatch({ type: WorkbenchActionType.OPEN_VIEW, part, component, context });
    }, [dispatch]);

    // 2. method to close a part in the workbench
    const closeView = React.useCallback((part: Part, component: React.ElementType) => {
        dispatch({ type: WorkbenchActionType.CLOSE_VIEW, part, component });
    }, [dispatch]);

    // 2. method to toggle a view in the workbench
    const toggleView = React.useCallback((part: Part, component: React.ElementType, context?: any) => {
        dispatch({ type: WorkbenchActionType.TOGGLE_VIEW, part, component, context });
    }, [dispatch]);

    // 4. method to check if the provided part is visible in the workbench
    const isViewOpen = (part: Part, component: React.ElementType): boolean => {
        return (parts[part] || []).some((view: View) => {
            return view.component === component;
        });
    };

    return (
        <WorkbenchContext.Provider value={{ parts, isViewOpen, openView, closeView, toggleView }}>
            {props.children}
        </WorkbenchContext.Provider>
    );
};

// hook to access to the context of the workbench part
export const useWorkbenchViewContext = (): any => {
    return (React.useContext(WorkbenchViewContext) as View)?.context || {};
};

// hook to control the view
export const useWorkbenchView = (): WorkbenchViewManager => {
    const workbench = React.useContext(WorkbenchContext);
    const view = React.useContext(WorkbenchViewContext);

    const close = React.useCallback(() => {
        workbench.closeView(view.part, view.component);
    }, [workbench, view]);

    return { close } as WorkbenchViewManager;
};

export type WorkbenchSlotProps = {
    part: Part;
    render?: (content: React.JSX.Element) => React.JSX.Element;
};

// @description component to display a specific part of the workbench
export const WorkbenchSlot = (props: WorkbenchSlotProps): React.JSX.Element | null => {
    const { parts } = useWorkbench();

    // if no visible parts are available
    if (!parts[props.part] || parts[props.part].length === 0) {
        return null;
    }

    // get the content and check if we have to wrap its content into the provided render method
    const content = (
        <React.Fragment>
            {parts[props.part].map((view: View, index: number) => {
                const Component = view.component as React.ElementType;
                return (
                    <WorkbenchViewContext.Provider key={index} value={view}>
                        <Component />
                    </WorkbenchViewContext.Provider>
                );
            })}
        </React.Fragment>
    );
    return props.render ? props.render(content) : content;
};
