import React from "react";
import {COLORS, SIZES, FONTS} from "../constants";

const StylesContext = React.createContext({});
const defaultStyles = {
    fillColors: {
        [COLORS.NONE]: "transparent",
        [COLORS.BLACK]: "#000",
    },
    strokeColors: {
        [COLORS.NONE]: "transparent",
        [COLORS.BLACK]: "#000",
    },
    strokeWidths: {
        [SIZES.MEDIUM]: 4,
    },
    fontSizes: {
        [SIZES.MEDIUM]: 16,
    },
    fontFaces: {
        [FONTS.SANS]: "Arial, sans-serif",
    },
    textColors: {
        [COLORS.NONE]: "transparent",
        [COLORS.BLACK]: "#000",
    },
};

export const useStyles = () => {
    return React.useContext(StylesContext);
};

// Styles provider
export const StylesProvider = props => (
    <StylesContext.Provider value={{...defaultStyles, ...props.value}}>
        {props.children}
    </StylesContext.Provider>
);
