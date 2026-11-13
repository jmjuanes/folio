import { useContext, createContext, useCallback, useState, useEffect, Children, isValidElement } from "react";
import type { JSX, PropsWithChildren, ReactNode } from "react";

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

export type RouteProps = {
    test: RegExp | string;
    render: () => JSX.Element;
};

export const Route = (props: RouteProps): JSX.Element | null => {
    const currentLocation = useLocation();

    // check if the current hash matches the provided regex
    if (props.test instanceof RegExp) {
        if (props.test.test(currentLocation)) {
            return props.render();
        }
    }

    // other case, return nothing
    return null;
};

export const Switch = (props: PropsWithChildren): JSX.Element | null => {
    const currentLocation = useLocation();
    let matchFound = false;
    let element: ReactNode;

    Children.forEach(props.children, child => {
        if (!matchFound && isValidElement(child)) {
            // Save this element --> If no route matches, we will render the last child automatically
            element = child;
            const childProps = child.props as RouteProps;
            if (typeof childProps.test === "string") {
                matchFound = childProps.test === "*" || childProps.test === currentLocation;
            }
            else if (childProps?.test instanceof RegExp) {
                matchFound = childProps.test.test(currentLocation);
            }
        }
    });
    // validate that we have found a valid react node
    if (element && isValidElement<RouteProps>(element) ) {
        return element.props.render();
    }
    return null;
};
