/** @type {import("jest").Config} */
export default {
    testEnvironment: "jsdom",
    transform: {},
    moduleNameMapper: {
        "^@lib(.*)$": "<rootDir>/lib$1",
        "^@components(.*)$": "<rootDir>/components$1",
    }
};
