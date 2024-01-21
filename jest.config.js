/** @type {import("jest").Config} */
const config = {
    testEnvironment: "jsdom",
    moduleNameMapper: {
        "^@lib(.*)$": "<rootDir>/lib$1",
        "^@elements(.*)$": "<rootDir>/elements$1",
        "^@components(.*)$": "<rootDir>/components$1",
    }
};

module.exports = config;
