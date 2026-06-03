import type { Context } from "koa";
import { HTTP_CODES } from "../constants.ts";

// error/warning response object
export type ResponseMessage = {
    message: string;
};

// response data object
export type ResponseData = {
    warnings?: ResponseMessage[];
    errors?: ResponseMessage[];
    data?: any;
};

// send the provided response
export const sendResponse = (context: Context, responseCode: number, responseData: ResponseData = {}) => {
    context.status = responseCode;
    context.body = responseData;
};

// send the provided response data
export const sendDataResponse = (context: Context, data: any) => {
    sendResponse(context, HTTP_CODES.OK, { data: data });
};

// send the provided error message
export const sendErrorResponse = (context: Context, errorCode: number, errorMessage: string) => {
    sendResponse(context, errorCode, {
        errors: [
            { message: errorMessage },
        ],
    });
};
