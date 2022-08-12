import {create} from "@siimple/styled";
import {fonts} from "@siimple/preset-base";

// theme colors
export const COLORS = {
    PRIMARY: "#fec56d",
    SECONDARY: "",
    DARK: "#161b29",
    LIGHT: "#8c8e9e",
    ERROR: "#C2554F",
    INFO: "#007FC1",
    SUCCESS: "#19835D",
    WHITE: "#fff",
};

export const {css, globalCss} = create({
    colors: {
        primary: COLORS.DARK,
        secondary: COLORS.SECONDARY,
        muted: COLORS.LIGHT,
        success: COLORS.SUCCESS,
        error: COLORS.ERROR,
    },
    fonts: {
        ...fonts,
        heading: "'EB Garamond', sans-serif",
    },
    // Mixins
    mixins: {
        root: {
            backgroundColor: COLORS.WHITE,
            color: COLORS.DARK,
            fontFamily: fonts.sans,
            fontSize: "16px",
            boxSizing: "border-box",
            "& *,& *:before,& *:after": {
                boxSizing: "inherit",
            },
        },
        bordered: {
            borderColor: "primary",
            borderRadius: "0.5rem",
            borderStyle: "solid",
            borderWidth: "0.125rem",
        },
        dialog: {
            apply: "mixins.bordered",
            boxShadow: "0rem 1rem 1rem -0.5rem rgba(54,63,79,0.25),0 0 0 1px rgba(54,63,79,0.02)",
        },
    },
});

// Global styles
globalCss({
    body: {
        // backgroundColor: "#fff",
        margin: "0px",
        padding: "0px",
    },
});

