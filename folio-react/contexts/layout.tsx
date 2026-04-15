import React from "react";
import { createPortal } from "react-dom";

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

export type LayoutOutletProps = {
    slot: LayoutSlot;
    portal?: boolean;
    render?: (Component: React.ElementType, data?: any) => React.JSX.Element;
};

// @description component to render registered components in a slot
export const LayoutOutlet = (props: LayoutOutletProps): React.JSX.Element | null => {
    const { layout } = useLayout();
    const entry = layout[props.slot];

    if (!entry || !entry.component) {
        return null;
    }

    const { component: Component, data } = entry;
    const content = props.render ? props.render(Component, data) : <Component {...data} />;

    return props.portal ? createPortal(content, document.body) : content;
};
