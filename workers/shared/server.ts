import { createServer } from "node:http";
import { Readable, Writable } from "node:stream";
import { createLogger } from "./logger.ts";

// start the application
export const startServer = async (namespace: string, port: number, env: any, worker: any) => {
    const { debug, info } = createLogger("folio:" + namespace);
    const server = createServer(async (req, res) => {
        const start = Date.now();
        const hasBody = req.method !== "GET" && req.method !== "HEAD";
        const request = new Request(`http://localhost${req.url}`, {
            method: req.method,
            headers: req.headers as HeadersInit,
            body: hasBody ? Readable.toWeb(req) : undefined,
            duplex: hasBody ? "half" : undefined,
        } as RequestInit);
        // generate response from worker
        const response = await worker.fetch(request, env);
        const end = Date.now();
        // register headers and status code in node response
        res.setHeader("X-Response-Time", `${(end - start)}ms`);
        res.writeHead(response.status, Object.fromEntries(response.headers));
        if (response.body) {
            await response.body.pipeTo(Writable.toWeb(res));
        } else {
            res.end();
        }
        // print in console information about the response
        info(`${req.method} ${req.url} - Returned ${res.statusCode} in ${end - start}ms`);
    });
    // 4. start http server in config.port
    debug(`starting server at port ${port}...`);
    server.listen(port, () => {
        info(`server running at 'http://127.0.0.1:${port}'`);
        info(`use Control-C to stop this server.`);
    });
};
