import React from "react";

// toaster context
export const ToasterContext = React.createContext(null);


// ToasterProvider component
export const ToasterProvider = ({ children }): React.JSX.Element => {
    return (
        <ToasterContext.Provider value={null}>
            {children}
        </ToasterContext.Provider>
    );
};
