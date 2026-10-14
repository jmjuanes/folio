import { useContext, createContext, useCallback, useState, useEffect } from "react";
import type { JSX, PropsWithChildren } from "react";

// @description get current hash fragment
const getCurrentHash = (): string => {
    return (window.location.hash || "#").replace("#", "");
};

// internal router context
export const RouterContext = createContext<string>("");

// @description hook to access to the current location
export const useLocation = (): string => {
    return useContext(RouterContext);
};

// @description hook to create a navigation to redirect to a new path
export const useNavigate = () => {
    return useCallback((to: string) => {
        window.location.hash = to || "";
    }, []);
};

// main router provider
export const RouterProvider = (props: PropsWithChildren): JSX.Element => {
    const [currentLocation, setCurrentLocation] = useState(() => {
        return getCurrentHash();
    });

    // hook to listen for changes in the hash
    useEffect(() => {
        const handleHashChange = () => {
            setCurrentLocation(getCurrentHash());
        };
        window.addEventListener("hashchange", handleHashChange);
        // when app is unmounted, remove hashchange listener
        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, [setCurrentLocation]);

    return (
        <RouterContext.Provider value={currentLocation}>
            {props.children}
        </RouterContext.Provider>
    );
};
