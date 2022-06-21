const lightColors = Object.values({
    default: "rgb(255,255,255)",
    gray: "rgb(169, 176, 187)",
    blue: "rgb(115, 176, 244)",
    aqua: "rgb(102, 212, 241)",
    mint: "rgb(97, 221, 189)",
    green: "rgb(180, 223, 128)",
    purple: "rgb(179, 164, 238)",
    pink: "rgb(241, 153, 206)",
    yellow: "rgb(250, 210, 119)",
    red: "rgb(246, 131, 111)",
});

const darkColors = Object.values({
    default: "rgb(0,0,0)",
    gray: "rgb(66, 72, 82)",
    blue: "rgb(74, 136, 218)",
    aqua: "rgb(61, 173, 217)",
    mint: "rgb(59, 186, 154)",
    green: "rgb(137, 192, 84)",
    purple: "rgb(149, 121, 218)",
    pink: "rgb(213, 111, 172)",
    yellow: "rgb(245, 185, 69)",
    red: "rgb(232, 85, 62)",
});

// Export colors
export default {
    fillColors: lightColors,
    textColors: darkColors,
    strokeColors: darkColors,
};
