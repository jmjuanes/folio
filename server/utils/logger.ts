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
            console.debug(formatMessage(namespace, LogLevels.DEBUG, message));
        },
        error: (message: string) => {
            console.error(formatMessage(namespace, LogLevels.ERROR, message));
        },
    };
};
