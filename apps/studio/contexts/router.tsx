
import React from "react";
import { useHash } from "../hooks/use-hash.ts";

export type Router = [
    currentHash: string,
    redirect: (newHash: string) => void,
];

export type RouteProps = {
    test: RegExp | string;
    render: () => React.JSX.Element;
};

const RouterContext = React.createContext(null);

export const useRouter = (): Router|null => {
    return React.useContext(RouterContext);
};

export const Route = (props: RouteProps): React.JSX.Element|null => {
    const [currentHash] = useRouter();

    // check if the current hash matches the provided regex
    if (props.test instanceof RegExp) {
        if (props.test.test(currentHash)) {
            return props.render();
        }
    }

    // other case, return nothing
    return null;
};

export const Switch = ({ children }) => {
    const [currentHash] = useRouter();
    let matchFound = false;
    let element = null;

    React.Children.forEach(children, (child: React.JSX.Element) => {
        if (!matchFound && React.isValidElement(child)) {
            // Save this element --> If no route matches, we will render the last child automatically
            element = child;
            const childProps = child.props as RouteProps;
            if (childProps?.test) {
                if (typeof childProps.test === "string") {
                    matchFound = childProps.test === "*";
                }
                else if (childProps?.test instanceof RegExp) {
                    matchFound = childProps.test.test(currentHash);
                }
            }
        }
    });

    // return the element 
    return element?.props?.render?.() || null;
};

export const RouterProvider = ({ children }) => {
    const [hash, redirect] = useHash();

    return (
        <RouterContext.Provider value={[hash, redirect]}>
            {children}
        </RouterContext.Provider>
    );
};
