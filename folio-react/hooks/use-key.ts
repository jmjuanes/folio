import { useRef, useEffect } from "react";

// hook to execute the provided function when the user presses the specified key
export const useKey = (key: string, callback: (() => void)) => {
    const currentCallback = useRef<any>(null);

    // after every update, update the currentCallback referenced
    currentCallback.current = callback;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === key && typeof currentCallback.current === "function") {
                currentCallback.current();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [key]);
};

// hook to execute the provided function when the user presses the Escape Key
export const useEscapeKey = (callback: (() => void)): void => {
    useKey("Escape", callback);
};
