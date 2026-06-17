export type Logger = {
    debug: (message: string) => void;
    info: (message: string) => void;
    error: (message: string) => void;
};

// check if the debug variable includes the current namespace
// example: DEBUG=* and namespace=folio:cli --> returns true
// example: DEBUG=folio:* and namespace=folio:cli --> returns true
// example: DEBUG=folio:cli and namespace=folio:server --> returns false
const isDebugEnabled = (debug: string, namespace: string): boolean => {
    return debug === "*" || debug.split(",").some(ns => {
        return ns === namespace || namespace.startsWith(ns.replace("*", ""));
    });
};

// format message
const formatMessage = (namespace: string, level: string, message: string): string => {
    return `[${(new Date().toISOString())} ${namespace}] (${level}) ${message}`;
};

// create a new logger
export const createLogger = (namespace: string) : Logger => {
    return {
        debug: (message: string) => {
            if (isDebugEnabled(process.env.DEBUG || "", namespace)) {
                console.debug(formatMessage(namespace, "DEBUG", message));
            }
        },
        info: (message: string) => {
            console.log(formatMessage(namespace, "INFO", message));
        },
        error: (message: string) => {
            console.error(formatMessage(namespace, "ERROR", message));
        },
    };
};
