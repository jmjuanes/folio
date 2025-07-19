export type Logger = {
    log: (message: string) => void;
    debug: (message: string) => void;
};

// get current date
const getDate = (): string => {
    return new Date().toISOString();
};

// format message
const formatMessage = (namespace: string, message: string): string => {
    return `[${getDate()} ${namespace}] ${message}`;
};

// create a new logger
export const createLogger = (namespace: string) : Logger => {
    return {
        log: (message: string) => {
            console.log(formatMessage(namespace, message));
        },
        debug: (message: string) => {
            console.debug(formatMessage(namespace, message));
        },
    };
};
