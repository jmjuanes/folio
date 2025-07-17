import path from "node:path";
import { environment } from "../env.ts";
import { startServer } from "../index.ts";

// this is the root path of the project
// it is used to resolve paths to the data and www directories
const ROOT_PATH = path.resolve(process.cwd(), "../");

startServer({
    // server configuration
    port: environment.FOLIO_PORT ? parseInt(environment.FOLIO_PORT) : undefined,

    // paths to the server directories
    dataPath: path.resolve(ROOT_PATH, environment.FOLIO_DATA_PATH || "data"),
    wwwPath: path.resolve(ROOT_PATH, environment.FOLIO_WWW_PATH || "www"),

    // token configuration
    tokenExpiration: environment.FOLIO_TOKEN_EXPIRATION,
    tokenSecret: environment.FOLIO_TOKEN_SECRET,
});
