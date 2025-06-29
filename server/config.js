import path from "node:path";
import environment from "./env.js";

// check if the node environment is set to development or production
// export const IS_PROD = environment.NODE_ENV === "production";
export const isProd = () => {
    return process.env.NODE_ENV === "production";
}

// Port where the server will run
export const PORT = environment.FOLIO_PORT || 8080;

// paths to the server directories
export const ROOT_PATH = path.resolve(process.cwd(), "../");
export const DATA_PATH = path.resolve(ROOT_PATH, environment.FOLIO_DATA_PATH || "data");
export const WWW_PATH = path.resolve(ROOT_PATH, environment.FOLIO_WWW_PATH || "www");

// database
export const DB_PATH = path.join(DATA_PATH, environment.FOLIO_DB_NAME || "folio.sqlite");
export const DB_TABLE = environment.FOLIO_DB_TABLE || "documents";

// object types
export const OBJECT_TYPES = {
    BOARD: "board",
    PROPERTY: "property_item",
    USER: "user",
    LIBRARY: "library",
};

// api
export const API_VERSION = "";
export const API_PATH = "/api";

export const API_ENDPOINTS = {
    API: API_PATH,
    LOGIN: `${API_PATH}/login`,
    USER: `${API_PATH}/user`,
    BOARDS: `${API_PATH}/boards`,
    PROPERTIES: `${API_PATH}/properties`,
    STATUS: `${API_PATH}/status`,
};
