// Folio server: serves the editor and a minimal storage API backed by SQLite.
// It has no dependencies, it only uses the modules included in Node.js.
//
// There is no authentication: run it on your machine or in a trusted network.
//
// Environment variables:
//   FOLIO_HOST      address to listen on (default: 127.0.0.1)
//   FOLIO_PORT      port to listen on (default: 8080)
//   FOLIO_DATABASE  path to the SQLite database (default: ./data/folio.sqlite)
//   FOLIO_PUBLIC    folder with the built editor (default: ./public)

import { createReadStream, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { basename, dirname, extname, join, normalize, resolve, sep } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

const HOST = process.env.FOLIO_HOST || "127.0.0.1";
const PORT = Number(process.env.FOLIO_PORT || 8080);
const DATABASE = resolve(process.env.FOLIO_DATABASE || "data/folio.sqlite");
const PUBLIC_DIR = resolve(process.env.FOLIO_PUBLIC || "public");
const API_PREFIX = "/api";
const MAX_BODY_SIZE = 64 * 1024 * 1024; // boards can include embedded images

const MIME_TYPES: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json",
    ".txt": "text/plain; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
};

class HttpError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
    }
}

// database, same model as a key-value store: a value and its metadata for each key
mkdirSync(dirname(DATABASE), { recursive: true });
const db = new DatabaseSync(DATABASE);
db.exec("PRAGMA journal_mode = WAL");
db.exec("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT, metadata TEXT) STRICT");

const statements = {
    list: db.prepare("SELECT key, metadata FROM kv"),
    get: db.prepare("SELECT value, metadata FROM kv WHERE key = ?"),
    put: db.prepare(`
        INSERT INTO kv (key, value, metadata) VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, metadata = excluded.metadata
    `),
    delete: db.prepare("DELETE FROM kv WHERE key = ?"),
};

const sendJson = (res: ServerResponse, statusCode: number, body: object): void => {
    const payload = JSON.stringify(body);
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(payload),
        "Cache-Control": "no-store",
    });
    res.end(payload);
};

const readJsonBody = async (req: IncomingMessage): Promise<any> => {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
        size = size + chunk.length;
        if (size > MAX_BODY_SIZE) {
            throw new HttpError(413, "The request body is too large");
        }
        chunks.push(chunk);
    }
    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    }
    catch (error) {
        throw new HttpError(400, "The request body is not a valid JSON");
    }
};

// storage API, it keeps the same responses than the previous storage worker
const handleApi = async (req: IncomingMessage, res: ServerResponse, path: string): Promise<void> => {
    const method = req.method || "GET";
    if (path === "/status") {
        if (method !== "GET") {
            throw new HttpError(405, "Method not allowed");
        }
        return sendJson(res, 200, { data: { message: "ok" } });
    }
    // GET /api --> list entries, POST /api --> create entry
    if (path === "/") {
        if (method === "GET") {
            const rows = statements.list.all() as { key: string, metadata: string | null }[];
            return sendJson(res, 200, {
                data: rows.map(row => ({ id: row.key, metadata: JSON.parse(row.metadata || "{}") })),
            });
        }
        if (method === "POST") {
            const body = await readJsonBody(req);
            if (typeof body?.id !== "string" || !body.id || !body.value) {
                throw new HttpError(400, "fields 'id' and 'value' are required to register in the storage");
            }
            statements.put.run(body.id, JSON.stringify(body.value), JSON.stringify(body.metadata || {}));
            return sendJson(res, 200, { data: { id: body.id } });
        }
        throw new HttpError(405, "Method not allowed");
    }
    // GET/PATCH/DELETE /api/:id
    const match = path.match(/^\/([^/]+)\/?$/);
    if (!match) {
        throw new HttpError(404, "Not found");
    }
    const id = decodeURIComponent(match[1]);
    if (method === "GET") {
        const row = statements.get.get(id) as { value: string, metadata: string | null } | undefined;
        if (!row) {
            throw new HttpError(404, "Not found");
        }
        return sendJson(res, 200, {
            data: { id: id, value: JSON.parse(row.value), metadata: JSON.parse(row.metadata || "{}") },
        });
    }
    if (method === "PATCH") {
        // the entry is created if it does not exist yet (for example, the preferences)
        // and the fields that are not included in the body keep their previous value
        const body = await readJsonBody(req);
        const row = statements.get.get(id) as { value: string, metadata: string | null } | undefined;
        statements.put.run(
            id,
            body?.value !== undefined ? JSON.stringify(body.value) : (row?.value || "{}"),
            body?.metadata !== undefined ? JSON.stringify(body.metadata) : (row?.metadata || "{}"),
        );
        return sendJson(res, 200, { data: { message: "updated" } });
    }
    if (method === "DELETE") {
        statements.delete.run(id);
        return sendJson(res, 200, { data: { message: "deleted" } });
    }
    throw new HttpError(405, "Method not allowed");
};

// static files, any other route that is not a file returns the index (client-side navigation)
const handleStatic = (req: IncomingMessage, res: ServerResponse, pathname: string): void => {
    if (req.method !== "GET" && req.method !== "HEAD") {
        throw new HttpError(405, "Method not allowed");
    }
    const requested = normalize(join(PUBLIC_DIR, decodeURIComponent(pathname)));
    if (requested !== PUBLIC_DIR && !requested.startsWith(PUBLIC_DIR + sep)) {
        throw new HttpError(403, "Forbidden");
    }
    let file = requested;
    let stats = statSync(file, { throwIfNoEntry: false });
    if (stats?.isDirectory()) {
        file = join(file, "index.html");
        stats = statSync(file, { throwIfNoEntry: false });
    }
    if (!stats?.isFile()) {
        // a missing asset is a 404, a missing page is the app
        if (extname(pathname)) {
            throw new HttpError(404, "Not found");
        }
        file = join(PUBLIC_DIR, "index.html");
        stats = statSync(file, { throwIfNoEntry: false });
        if (!stats?.isFile()) {
            throw new HttpError(404, "Not found");
        }
    }
    const name = basename(file);
    res.writeHead(200, {
        "Content-Type": MIME_TYPES[extname(file)] || "application/octet-stream",
        "Content-Length": stats.size,
        // the index must always be revalidated, the files with a hash in the name never change
        "Cache-Control": name === "index.html" ? "no-cache" : (/\.[0-9a-f]{8,}\./.test(name) ? "public, max-age=31536000, immutable" : "public, max-age=3600"),
    });
    if (req.method === "HEAD") {
        res.end();
        return;
    }
    createReadStream(file).pipe(res);
};

const server = createServer(async (req, res) => {
    const { pathname } = new URL(req.url || "/", "http://localhost");
    const isApi = pathname === API_PREFIX || pathname.startsWith(API_PREFIX + "/");
    try {
        if (isApi) {
            await handleApi(req, res, pathname.slice(API_PREFIX.length) || "/");
        }
        else {
            handleStatic(req, res, pathname);
        }
    }
    catch (error: any) {
        const statusCode = error instanceof HttpError ? error.statusCode : (error instanceof URIError ? 400 : 500);
        if (statusCode === 500) {
            console.error(error);
        }
        if (res.headersSent) {
            return res.destroy();
        }
        const message = statusCode === 500 ? "Internal Server Error" : error.message;
        if (isApi) {
            return sendJson(res, statusCode, { errors: [{ message: message }] });
        }
        res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(message);
    }
});

// close the server and the database in a clean way (docker stop sends SIGTERM)
const shutdown = (): void => {
    server.close(() => {
        db.close();
        process.exit(0);
    });
    server.closeAllConnections();
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

server.listen(PORT, HOST, () => {
    console.log(`Folio is running on http://${HOST}:${PORT}`);
    console.log(`Database: ${DATABASE}`);
    console.log(`Editor: ${PUBLIC_DIR}`);
});
