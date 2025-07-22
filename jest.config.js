/** @type {import("jest").Config} */
export default {
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.(j|t)sx?$": "babel-jest",
    },
    extensionsToTreatAsEsm: [".jsx", ".tsx", ".ts", ".js"],
};
