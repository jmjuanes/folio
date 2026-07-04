import React from "react";

export const AssetsContext = React.createContext({});

// Hook to obtain assets
export const useAssets = () => {
    return React.useContext(AssetsContext);
};

// Assets provider component
export const AssetsProvider = props => (
    <AssetsContext value={props.value || {}}>
        {props.children}
    </AssetsContext>
);
