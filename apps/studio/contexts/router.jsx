
import React from "react";
import {useHash} from "../hooks/use-hash.js";

const RouterContext = React.createContext(null);

export const useRouter = () => {
    return React.useContext(RouterContext);
};

export const Route = props => {
    const [currentHash] = useRouter();
    // Check if the current hash matches the provided regex
    if (props.test.test(currentHash)) {
        return props.render();
    }
    // Other case, return nothing
    return null;
};

export const Switch = props => {
    const [currentHash] = useRouter();
    let matchFound = false;
    let element = null;

    React.Children.forEach(props.children, child => {
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

export const RouterProvider = props => {
    const [hash, redirect] = useHash();

    return (
        <RouterContext.Provider value={[hash, redirect]}>
            {props.children}
        </RouterContext.Provider>
    );
};
