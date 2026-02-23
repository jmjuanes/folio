// import type { Context } from "koa";
import { HTTP_CODES } from "../constants.ts";

// send the provided response data
export const sendData = (context: any, data: any = {}) => {
    context.status = HTTP_CODES.OK;
    context.body = {
        data: data,
    };
};

// send the provided error message
export const sendError = (context: any, errorCode: number, errorMessage: string) => {
    context.status = errorCode;
    context.body = {
        errors: [
            { message: errorMessage },
        ],
    };
};
