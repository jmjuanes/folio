import defaultTheme from "@siimple/preset-theme";
import reboot from "@siimple/preset-reboot";
import elements from "@siimple/preset-elements";
import helpers from "@siimple/preset-helpers";

// theme colors
const COLORS = {
    PRIMARY: "#fec56d",
    SECONDARY: "",
    DARK: "#161b29",
    LIGHT: "#f8f8fb",
    ERROR: "#C2554F",
    INFO: "#007FC1",
    SUCCESS: "#19835D",
};

export default {
    ...defaultTheme,
    colors: {
        primary: COLORS.PRIMARY,
        secondary: COLORS.SECONDARY,
        body: COLORS.DARK,
        muted: COLORS.LIGHT,
        background: "#fff",
        error: COLORS.ERROR,
        info: COLORS.INFO,
        success: COLORS.SUCCESS,
    },
    styles: {
        ...reboot.styles,
        ...elements.styles,
        ...helpers.styles,
        ".is-bordered": {
            border: `2px solid ${COLORS.DARK}`,
        },
    },
};
