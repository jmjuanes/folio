import { STATUS_CODES } from "node:http";

// generate the inverse map of status code -> status number
// example HTTP_CODES.OK --> 200
export const HTTP_CODES = {} as Record<string, number>;
Object.keys(STATUS_CODES).forEach((code: number) => {
    HTTP_CODES[STATUS_CODES[code].replaceAll(" ", "_").toUpperCase()] = code;
});

export const API_ERROR_MESSAGES = {
    NOT_FOUND: "resource not found",
    METHOD_NOT_ALLOWED: "method not allowed",
    INTERNAL_SERVER_ERROR: "internal server error",
    INVALID_TOKEN: "invalid or expired token",
    TOKEN_NOT_PROVIDED: "token is required",
};
