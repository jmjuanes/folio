import { createServer } from "node:http";
import { Readable, Writable } from "node:stream";
import { createKV } from "./kv.ts";
import { createLogger } from "./logger.ts";
import worker from "./worker.ts";
import type { Env } from "./types.ts";
import type { Config } from "./config.ts";

// start the application
export const startServer = async (config: Config) => {
    const { debug, info } = createLogger("folio:server");
    const isAccessTokenAuth = config.authentication === "access_token";
    // 1. create environment for the worker
    const env: Env = {
        ACCESS_TOKEN: isAccessTokenAuth ? config.access_token : "",
        ALLOWED_ORIGINS: config.cors_allowed_origins || "*",
        AUTHENTICATION: !isAccessTokenAuth ? (await createKV(config.authentication, "authentication")) : null,
        STORAGE: (await createKV(config.storage, "storage")),
    };
    // 2. create the http server instance
    const server = createServer(async (req, res) => {
        const hasBody = req.method !== "GET" && req.method !== "HEAD";
        const request = new Request(`http://localhost${req.url}`, {
            method: req.method,
            headers: req.headers as HeadersInit,
            body: hasBody ? Readable.toWeb(req) : undefined,
            duplex: hasBody ? "half" : undefined,
        } as RequestInit);

        const response = await worker.fetch(request, env);

        res.writeHead(response.status, Object.fromEntries(response.headers));
        if (response.body) {
            await response.body.pipeTo(Writable.toWeb(res));
        } else {
            res.end();
        }
    });
    // 3. start http server in config.port
    debug(`starting server at port ${config.port}...`);
    server.listen(Number(config.port), () => {
        info(`server running at 'http://127.0.0.1:${config.port}'`);
        info(`use Control-C to stop this server.`);
    });
};
