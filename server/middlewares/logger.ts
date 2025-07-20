import { createLogger } from "../utils/logger.ts";
import type { ExtendedContext } from "../types/custom.ts";

const { log } = createLogger("folio:http");

// simple logger middleware
export const logger = () => {
    return async (ctx: ExtendedContext, next: () => Promise<void>) => {
        const start = Date.now();
        await next();
        ctx.set("X-Response-Time", `${(Date.now() - start)}ms`);
        log(`${ctx.method} ${ctx.url} - Returned ${ctx.status} in ${ctx.response.get("X-Response-Time")}`);
    };
};
