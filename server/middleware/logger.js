// simple logger middleware
export const logger = () => {
    return async (ctx, next) => {
        const start = Date.now();
        await next();
        ctx.set("X-Response-Time", `${(Date.now() - start)}ms`);
        console.log(`[folio:server] ${ctx.method} ${ctx.url} - Returned ${ctx.status} in ${ctx.response.get("X-Response-Time")}`);
    };
};
