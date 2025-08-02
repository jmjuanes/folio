import React from "react";

// internal instance of EventEmitter to handle subscribe/emit events
const globalEventEmitter = new EventTarget();

// export the hook to dispatch an event
export const useEventEmitter = (eventName: string) => {
    return React.useCallback((eventData: any) => {
        const event = new CustomEvent(eventName, { detail: eventData });
        globalEventEmitter.dispatchEvent(event);
    }, [ eventName ]);
};

// export the hook to listen to an event
export const useEventListener = <T>(eventName: string): T => {
    const [ eventData, setEventData ] = React.useState<T>(null);

    // listen to eventName
    React.useEffect(() => {
        const listener = (event: Event) => {
            setEventData((event as CustomEvent).detail);
        };
        // add a listener to eventName
        globalEventEmitter.addEventListener(eventName, listener);
        return () => {
            globalEventEmitter.removeEventListener(eventName, listener);
        };
    }, [ eventName, setEventData ]);

    // return the current event
    return eventData;
};
