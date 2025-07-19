import Koa from "koa";

// extended Koa context type to include custom methods
export type ExtendedContext = Koa.Context & {
    send: (status: number, body?: any) => void;
    ok: (body?: any) => void;
};
