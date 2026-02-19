import React from "react";

export type AiManager = {};

export type AiProviderProps = {
    children: React.ReactNode,
};

// export ai context to
export const AiContext = React.createContext<AiManager | null>(null);

// export hook to access to the ai manager
export const useAi = (): AiManager | null => {
    return React.useContext(AiContext);
};

export const AiProvider = (props: AiProviderProps): React.JSX.Element => {
    return (
        <AiContext.Provider value={null}>
            {props.children}
        </AiContext.Provider>
    );
};
