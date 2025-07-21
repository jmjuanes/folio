
import React from "react";
import { useHash } from "../hooks/use-hash.ts";

export type Router = {
    hash: string;
    redirect: (hash: string) => void;
};

export type RouteProps = {
    test: RegExp;
    render: () => React.JSX.Element;
};

const RouterContext = React.createContext(null);

export const useRouter = (): Router|null => {
    return React.useContext(RouterContext);
};

export const Route = (props: RouteProps): React.JSX.Element|null => {
    const [currentHash] = useRouter();
    // Check if the current hash matches the provided regex
    if (props.test.test(currentHash)) {
        return props.render();
    }
    // Other case, return nothing
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
            if (child.props.test) {
                matchFound = child.props.test === "*" || child.props.test.test(currentHash);
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
