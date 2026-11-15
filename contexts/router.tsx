import { useContext, createContext, useMemo, useSyncExternalStore, Children, isValidElement } from "react";
import type { JSX, PropsWithChildren, ReactNode } from "react";

export type RouterMode = "hash" | "memory";

type History = {
    get: () => string;
    push: (to: string) => void;
    subscribe: (listener: () => void) => () => void;
};

// @description history based on the hash fragment of the url
const createHashHistory = (): History => {
    return {
        get: () => (window.location.hash || "#").replace("#", ""),
        push: to => {
            window.location.hash = to || "";
        },
        subscribe: listener => {
            window.addEventListener("hashchange", listener);
            return () => {
                window.removeEventListener("hashchange", listener);
            };
        },
    };
};

// @description history that lives in memory (useful for tests, SSR, embedded apps...)
const createMemoryHistory = (initialLocation = ""): History => {
    const listeners = new Set<() => void>();
    let location = initialLocation;
    return {
        get: () => location,
        push: to => {
            location = to || "";
            listeners.forEach(listener => listener());
        },
        subscribe: listener => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
};

// router context value
type RouterContextValue = {
    location: string;
    navigate: (to: string) => void;
};

// internal router context
export const RouterContext = createContext<RouterContextValue>({} as RouterContextValue);

// @description hook to access to the current location
export const useLocation = (): string => {
    return useContext(RouterContext).location;
};

// @description hook to get the function to navigate to a new path
export const useNavigate = () => {
    return useContext(RouterContext).navigate;
};

export type RouterProviderProps = PropsWithChildren<{
    router?: RouterMode;
    initialLocation?: string; // only used in memory mode
}>;

// main router provider
export const RouterProvider = (props: RouterProviderProps): JSX.Element => {
    const history = useMemo(() => {
        if (props.router === "memory") {
            return createMemoryHistory(props.initialLocation || "");
        }
        // default -> hash routing
        return createHashHistory();
    }, [props.router, props.initialLocation]);
    const currentLocation = useSyncExternalStore(history.subscribe, history.get);

    return (
        <RouterContext.Provider value={{ location: currentLocation, navigate: history.push }}>
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
