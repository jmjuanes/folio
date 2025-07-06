/** @type {import("jest").Config} */
export default {
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.(js|jsx)$": "babel-jest",
    },
    extensionsToTreatAsEsm: [".jsx"],
    moduleNameMapper: {
        "^@lib(.*)$": "<rootDir>/lib$1",
        "^@components(.*)$": "<rootDir>/components$1",
    }
};
