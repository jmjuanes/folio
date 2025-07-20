// inverse map of status code -> status number
// example HTTP_CODES.OK --> 200
export const HTTP_CODES: Record<string,number> = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    INTERNAL_SERVER_ERROR: 500,
};

export const API_ERROR_MESSAGES = {
    NOT_FOUND: "resource not found",
    METHOD_NOT_ALLOWED: "method not allowed",
    INTERNAL_SERVER_ERROR: "internal server error",
    AUTHENTICATION_REQUIRED: "authentication required to access this resource",
    INVALID_TOKEN: "invalid or expired token",
    TOKEN_NOT_PROVIDED: "token is required",
};
