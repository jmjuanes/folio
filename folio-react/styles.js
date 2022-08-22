import {create} from "@siimple/styled";
import {fonts} from "@siimple/preset-base";
import {elementsBase} from "@siimple/modules/elements.js";

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

export const {css, globalCss, keyframes} = create({
    colors: {
        primary: COLORS.DARK,
        secondary: COLORS.WHITE,
        muted: COLORS.LIGHT,
    },
    fonts: {
        body: fonts.sans,
        heading: "'EB Garamond', sans-serif",
    },
    // Mixins
    mixins: {
        root: {
            backgroundColor: COLORS.WHITE,
            color: "primary",
            fontFamily: "body",
            fontSize: "16px",
            boxSizing: "border-box",
            "& *,& *:before,& *:after": {
                boxSizing: "border-box",
            },
        },
        bordered: {
            borderColor: "primary",
            borderRadius: "0.5rem",
            borderStyle: "solid",
            borderWidth: "0.125rem",
        },
        shadowed: {
            boxShadow: [
                "0rem 1rem 1rem -0.5rem rgba(54,63,79,0.25)",
                "0 0 0 1px rgba(54,63,79,0.02)",
            ].join(","),
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

// Shared styles
export const alertClass = css({
    ...elementsBase.alert,
    display: "flex",
    marginBottom: "0px",
    marginTop: "0.5rem",
});

export const buttonClass = css({
    ...elementsBase.button,
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    width: "100%",
});
export const outlineButtonClass = css({
    ...elementsBase.button,
    alignItems: "center",
    backgroundColor: "white",
    color: "primary",
    display: "flex",
    justifyContent: "center",
    width: "100%",
    "&:hover": {
        backgroundColor: "primary",
        color: "white",
    },
    apply: "mixins.bordered",
});
export const buttonIconClass = css({
    fontSize: "1.5rem",
    height: "1.5rem",
    paddingRight: "0.5rem",
});

export const scrimClass = css({
    ...elementsBase.scrim,
    backdropFilter: "blur(2px)",
});
export const modalClass = css({
    apply: "mixins.bordered",
    backgroundColor: "#fff",
    display: "block",
    // maxWidth: "400px",
    padding: "2.5rem",
    width: "100%",
});
export const closeClass = css({
    ...elementsBase.close,
    // color: "primary",
});

export const inputClass = css({
    ...elementsBase.input,
    backgroundColor: "white",
    apply: "mixins.bordered",
});
export const sliderClass = css({
    ...elementsBase.slider,
});

export const switchClass = css({
    ...elementsBase.switch,
});

export const titleClass = css({
    ...elementsBase.title,
    // fontSize: "2rem",
    fontFamily: "heading",
    userSelect: "none",
});

// fade-in animation
const fadeInAnimation = keyframes({
    from: {
        bottom: "-6rem",
        opacity: "0",
    },
    to: {
        bottom: "0px",
        opacity: "1",
    },
});

export const fadeIn = css({
    animationDuration: "0.3s",
    animationName: fadeInAnimation, 
    animationTimingFunction: "ease-out",
    bottom: "0px",
    position: "absolute",
    opacity: "1",
});
