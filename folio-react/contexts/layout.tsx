import React from "react";

export enum LayoutSlot {
    SIDEBAR = "sidebar",
    OVERLAY = "overlay",
    FLOATING = "floating",
};

export type LayoutRegistry = {
    [key in LayoutSlot]?: {
        component: React.ElementType | null;
        data?: any;
    };
};

export enum LayoutActionType {
    SHOW = "show",
    HIDE = "hide",
    TOGGLE = "toggle",
};

export type LayoutAction =
    | { type: LayoutActionType.SHOW; slot: LayoutSlot; component: React.ElementType; data?: any }
    | { type: LayoutActionType.HIDE; slot: LayoutSlot }
    | { type: LayoutActionType.TOGGLE; slot: LayoutSlot; component: React.ElementType; data?: any };

export type LayoutManager = {
    layout: LayoutRegistry;
    showComponent: (slot: LayoutSlot, component: React.ElementType, data?: any) => void;
    hideComponent: (slot: LayoutSlot) => void;
    toggleComponent: (slot: LayoutSlot, component: React.ElementType, data?: any) => void;
};

// @description layout context
export const LayoutContext = React.createContext<LayoutManager>({} as LayoutManager);
export const LayoutOutletContext = React.createContext<any>(null);

// @description hook to access layout management
export const useLayout = (): LayoutManager => {
    return React.useContext(LayoutContext);
};

export type LayoutProviderProps = {
    children: React.ReactNode;
};

// @description layout provider component
export const LayoutProvider = (props: LayoutProviderProps): React.JSX.Element => {
    const [layout, dispatch] = React.useReducer((state: LayoutRegistry, action: LayoutAction) => {
        const nextState = { ...state };
        switch (action.type) {
            case LayoutActionType.SHOW:
                nextState[action.slot] = { component: action.component, data: action.data };
                break;
            case LayoutActionType.HIDE:
                delete nextState[action.slot];
                break;
            case LayoutActionType.TOGGLE:
                if (state[action.slot]?.component === action.component) {
                    delete nextState[action.slot];
                } else {
                    nextState[action.slot] = { component: action.component, data: action.data };
                }
                break;
        }
        return nextState;
    }, {} as LayoutRegistry);

    const showComponent = React.useCallback((slot: LayoutSlot, component: React.ElementType, data?: any) => {
        dispatch({ type: LayoutActionType.SHOW, slot, component, data });
    }, []);

    const hideComponent = React.useCallback((slot: LayoutSlot) => {
        dispatch({ type: LayoutActionType.HIDE, slot });
    }, []);

    const toggleComponent = React.useCallback((slot: LayoutSlot, component: React.ElementType, data?: any) => {
        dispatch({ type: LayoutActionType.TOGGLE, slot, component, data });
    }, []);

    return (
        <LayoutContext.Provider value={{ layout, showComponent, hideComponent, toggleComponent }}>
            {props.children}
        </LayoutContext.Provider>
    );
};

export const useLayoutOutlet = (): any => {
    return React.useContext(LayoutOutletContext);
};

export type LayoutOutletProps = {
    slot: LayoutSlot;
    portal?: boolean;
    render?: (Component: React.ElementType, data?: any) => React.JSX.Element;
};

// @description component to render registered components in a slot
export const LayoutOutlet = (props: LayoutOutletProps): React.JSX.Element | null => {
    const { layout } = useLayout();
    const entry = layout[props.slot];

    // 1. check if the entry exists and there is a component registered
    if (!entry || !entry?.component) {
        return null;
    }

    // 2. get the component and data from the entry, and render the content
    const { component: Component, data } = entry;
    const content = props.render ? props.render(Component) : <Component />;

    // 3. render the component in the layout outlet context
    return (
        <LayoutOutletContext.Provider value={data || {}}>
            {content}
        </LayoutOutletContext.Provider>
    );
};
