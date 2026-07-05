/** @type {import("jest").Config} */
export default {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: [
        "@testing-library/jest-dom",
    ],
    transform: {
        "^.+\\.(j|t)sx?$": "babel-jest",
    },
    extensionsToTreatAsEsm: [".jsx", ".tsx", ".ts"],
};
