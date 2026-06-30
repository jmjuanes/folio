// helper to send a JSON response
export const sendResponse = (env: any, request: Request, statusCode: number, body: any, extraHeaders: Record<string, string> = {}): Response => {
    const origin = request.headers.get("Origin");
    const allowedOrigins = env.ALLOWED_ORIGINS || "*";
    const responseOrigin = (allowedOrigins === "*" || allowedOrigins === origin) ? (origin || allowedOrigins) : allowedOrigins;
    const responseHeaders: Record<string, string> = {
        "Access-Control-Allow-Origin": responseOrigin,
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
    // include content-type header if body is sent in the response
    if (body) {
        responseHeaders["Content-Type"] = "application/json";
    }
    // merge response headers with extra headers and send the response
    return new Response(body ? JSON.stringify(body) : null, {
        status: statusCode,
        headers: Object.assign({}, responseHeaders, extraHeaders || {}),
    });
};

export const sendDataResponse = (env: any, request: Request, data: any): Response => {
    return sendResponse(env, request, 200, { data });
};

export const sendErrorResponse = (env: any, request: Request, errorCode: number, errorMessage: string): Response => {
    return sendResponse(env, request, errorCode, {
        errors: [
            { message: errorMessage },
        ],
    });
};
