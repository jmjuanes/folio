export class ValidationError extends Error {
    statusCode = 400;
    name = "ValidationError";
    constructor(message: string) {
        super(message);
    }
};

export class UnauthorizedError extends Error {
    statusCode = 401;
    name = "UnauthorizedError";
    constructor(message?: string) {
        super(message || "Unauthorized.");
    }
};

export class NotFoundError extends Error {
    statusCode = 404;
    name = "NotFoundError";
    constructor(message?: string) {
        super(message || "Not found");
    }
};

export class MethodNotAllowedError extends Error {
    statusCode = 405;
    name = "MethodNotAllowedError";
    constructor() {
        super("Method not allowed");
    }
};

export class InternalServerError extends Error {
    statusCode = 500;
    name = "InternalServerError";
    constructor(message?: string) {
        super(message || "Internal Server Error");
    }
};
