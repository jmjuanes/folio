import React from "react";
import {THEMES} from "../constants.js";
import defaultTheme from "../themes/default.js";

// map themes to themes definitions
const themesConfig = {
    [THEMES.DEFAULT]: defaultTheme,
};

// export theme context
export const ThemeContext = React.createContext({theme: THEMES.DEFAULT});

// hook to get the current theme
export const useTheme = () => {
    return React.useContext(ThemeContext).theme;
};

// helper method to get a list of classnames to apply to the element
export const themed = (...args) => {
    const theme = useTheme();
    return args.map(item => {
        if (typeof item === "string") {
            return themesConfig[theme][item] || item || "";
        }
        else if (typeof item === "object" && !!item) {
            return Object.keys(item)
                .filter(key => !!item[key])
                .map(key => themesConfig[theme][key] || key || "")
                .join(" ");
        }
        else if (!!item && Array.isArray(item)) {
            return item.map(key => !!key ? (themesConfig[theme][key] || key || "") : "").join(" ");
        }
        else {
            return "";
        }
    }).join(" ");
};

// theme provider wrapper
export const ThemeProvider = props => {
    return (
        <ThemeContext.Provider value={{theme: props.theme}}>
            {props.children}
        </ThemeContext.Provider>
    );
};
