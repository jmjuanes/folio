import React from "react";
import { getCurrentHash } from "../utils/hash.ts";

export type HashChange = (newHash: string) => void;

// @description hook to access to the current path and redirect to a new hash
// @returns [hash, redirect]
export const useHash = (): [string, HashChange]  => {
    const [currentHash, setCurrentHash] = React.useState(() => {
        return getCurrentHash();
    });

    // hook to redirect to a new hash
    const handleRedirect: HashChange = React.useCallback((newHash: string) => {
        window.location.hash = newHash || "#";
    }, []);

    // hook to listen for changes in the hash
    React.useEffect(() => {
        const handleHashChange = () => {
            setCurrentHash(getCurrentHash());
        };
        window.addEventListener("hashchange", handleHashChange);
        // when app is unmounted, remove hashchange listener
        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    return [ currentHash, handleRedirect ];
};
