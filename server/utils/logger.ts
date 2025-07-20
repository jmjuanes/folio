import { env } from "process";
import { environment } from "../env.js";

export type Logger = {
    log: (message: string) => void;
    info: (message: string) => void;
    debug: (message: string) => void;
    error: (message: string) => void;
};

export enum LogLevels {
    INFO = "INFO",
    DEBUG = "DEBUG",
    ERROR = "ERROR",
};

// check if the debug variable includes the current namespace
// example: DEBUG=* and namespace=folio:cli --> returns true
// example: DEBUG=folio:* and namespace=folio:cli --> returns true
// example: DEBUG=folio:cli and namespace=folio:server --> returns false
const isDebugEnabled = (namespace: string): boolean => {
    if (environment.DEBUG === "*") {
        return true; // all namespaces are enabled
    }
    return environment.DEBUG.split(",").some(ns => {
        return ns === namespace || namespace.startsWith(ns.replace("*", ""));
    });
};

// get current date
const getDate = (): string => {
    return new Date().toISOString();
};

// format message
const formatMessage = (namespace: string, level: LogLevels, message: string): string => {
    return `[${getDate()} ${namespace}] (${level}) ${message}`;
};

// create a new logger
export const createLogger = (namespace: string) : Logger => {
    return {
        // @deprecated use info instead
        log: (message: string) => {
            console.log(formatMessage(namespace, LogLevels.INFO, message));
        },
        info: (message: string) => {
            console.log(formatMessage(namespace, LogLevels.INFO, message));
        },
        debug: (message: string) => {
            if (environment.DEBUG && isDebugEnabled(namespace)) {
                console.debug(formatMessage(namespace, LogLevels.DEBUG, message));
            }
        },
        error: (message: string) => {
            console.error(formatMessage(namespace, LogLevels.ERROR, message));
        },
    };
};
