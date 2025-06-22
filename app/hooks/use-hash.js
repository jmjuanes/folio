import React from "react";

// @description hook to access to the current path and redirect to a new hash
// @returns [hash, redirect]
export const useHash = () => {
    const [currentHash, setCurrentHash] = React.useState(() => {
        return window.location.hash || "#";
    });

    // hook to redirect to a new hash
    const handleRedirect = React.useCallback(newHash => {
        window.location.hash = newHash;
    }, []);

    // hook to listen for changes in the hash
    React.useEffect(() => {
        const handleHashChange = () => {
            setCurrentHash(window.location.hash || "#");
        };
        window.addEventListener("hashchange", handleHashChange);
        // when app is unmounted, remove hashchange listener
        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    return [
        currentHash.replace(/^#/, ""),
        handleRedirect,
    ];
};
