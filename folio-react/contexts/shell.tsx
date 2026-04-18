import React from "react";

export type PanelsRegistry = {
    [key in string]: React.ElementType | null;
};

export type PanelsRegistryAction = {
    type: "show" | "close" | "toggle";
    id: string;
    component: React.ElementType | null;
};

export type ShellPanelsManager = {
    panels: PanelsRegistry;
    isPanelOpen: (id: string) => boolean;
    openPanel: (id: string, component: React.ElementType | null) => void;
    togglePanel: (id: string, component: React.ElementType | null) => void;
    closePanel: (id: string) => void;
};

// @description panels context
export const ShellPanelsContext = React.createContext<ShellPanelsManager>({} as ShellPanelsManager);

// @description hook to access to panels
export const useShellPanels = (): ShellPanelsManager => {
    return React.useContext(ShellPanelsContext);
};

// @description panels provider
export const ShellPanelsProvider = (props: React.PropsWithChildren): React.JSX.Element => {
    const [panels, setPanels] = React.useReducer((prevPanels: PanelsRegistry, action: PanelsRegistryAction) => {
        const newPanels = Object.assign({}, prevPanels);
        switch (action.type) {
            case "show":
                newPanels[action.id] = action.component;
                break;
            case "close":
                newPanels[action.id] = null;
                break;
            case "toggle":
                newPanels[action.id] = newPanels[action.id] === action.component ? null : action.component;
                break;
        }
        return newPanels;
    }, {} as PanelsRegistry);

    // 1. method to show a panel by ID
    const openPanel = React.useCallback((id: string, component: React.ElementType | null) => {
        setPanels({ type: "show", id, component });
    }, [setPanels]);

    // 2. method to close a panel by ID
    const closePanel = React.useCallback((id: string) => {
        setPanels({ type: "close", id, component: null });
    }, [setPanels]);

    // 3. method to toggle a panel by ID
    const togglePanel = React.useCallback((id: string, component: React.ElementType | null) => {
        setPanels({ type: "toggle", id, component });
    }, [setPanels]);

    const isPanelOpen = (id: string) => {
        return !!panels[id];
    };

    return (
        <ShellPanelsContext.Provider value={{ panels, isPanelOpen, openPanel, closePanel, togglePanel }}>
            {props.children}
        </ShellPanelsContext.Provider>
    );
};

export type ShellPanelSlotProps = {
    id: string;
    render?: (content: React.JSX.Element) => React.JSX.Element;
};

// @description component to render panel in the provided position
export const PanelSlot = (props: ShellPanelSlotProps): React.JSX.Element | null => {
    const { panels } = useShellPanels();
    // 1. if an id is provided and we have registered a panel in this slot 
    if (props.id && !!panels[props.id]) {
        const Component = panels[props.id] as React.ElementType;
        const content = <Component />;
        return props.render ? props.render(content) : content;
    }
    // no panel rendered on this slot
    return null;
};
