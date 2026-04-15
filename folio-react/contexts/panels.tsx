import React from "react";

export type PanelsRegistry = {
    [key in string]: React.ElementType | null;
};

export type PanelsRegistryAction = {
    type: "show" | "hide" | "toggle";
    position: string;
    component: React.ElementType | null;
};

export type PanelsManager = {
    panels: PanelsRegistry;
    showPanel: (position: string, component: React.ElementType | null) => void;
    hidePanel: (position: string) => void;
    togglePanel: (position: string, component: React.ElementType | null) => void;
};

// @description panels context
export const PanelsContext = React.createContext<PanelsManager>({} as PanelsManager);

// @description hook to access to panels
export const usePanels = (): PanelsManager => {
    return React.useContext(PanelsContext);
};

// @description panels provider
export const PanelsProvider = (props: React.PropsWithChildren): React.JSX.Element => {
    const [panels, setPanels] = React.useReducer((prevPanels: PanelsRegistry, action: PanelsRegistryAction) => {
        const newPanels = Object.assign({}, prevPanels);
        switch (action.type) {
            case "show":
                newPanels[action.position] = action.component;
                break;
            case "hide":
                newPanels[action.position] = null;
                break;
            case "toggle":
                newPanels[action.position] = newPanels[action.position] === action.component ? null : action.component;
                break;
        }
        return newPanels;
    }, {} as PanelsRegistry);

    // 1. method to show a panel by position ID
    const showPanel = React.useCallback((position: string, component: React.ElementType | null) => {
        setPanels({ type: "show", position, component });
    }, [setPanels]);

    // 2. method to hide a panel by position ID
    const hidePanel = React.useCallback((position: string) => {
        setPanels({ type: "hide", position, component: null });
    }, [setPanels]);

    // 3. method to toggle a panel by position ID
    const togglePanel = React.useCallback((position: string, component: React.ElementType | null) => {
        setPanels({ type: "toggle", position, component });
    }, [setPanels]);

    return (
        <PanelsContext.Provider value={{ panels, showPanel, hidePanel, togglePanel }}>
            {props.children}
        </PanelsContext.Provider>
    );
};

export type PanelOutletProps = {
    position: string;
    render?: (PanelComponent: React.ElementType) => React.JSX.Element;
};

// @description component to render panel in the provided position
export const PanelOutlet = (props: PanelOutletProps): React.JSX.Element | null => {
    const { panels } = usePanels();
    // 1. if a render method is provided and 
    if (props.position && !!panels[props.position]) {
        const Component = panels[props.position] as React.ElementType;
        return props.render ? props.render(Component) : <Component />;
    }
    // no panel rendered on this slot
    return null;
};
