import React from "react";

const RouterContext = React.createContext("");

// Use router hook
export const useRouter = () => {
    const currentPath = React.useContext(RouterContext);
    return {
        currentPath: currentPath || "#",
        redirect: newPath => {
            window.location.hash = newPath;
        },
    };
};

export const Route = props => {
    const {currentPath} = useRouter();
    // Check if the current path matches the provided regex
    if (props.test.test(currentPath)) {
        return props.render();
    }
    // Other case, return nothing
    return null;
};

export const Switch = props => {
    const {currentPath} = useRouter();
    let matchFound = false;
    let element = null;
    React.Children.forEach(props.children, child => {
        if (!matchFound && React.isValidElement(child)) {
            // Save this element --> If no route matches, we will render the last child automatically
            element = child;
            if (child.props.test) {
                matchFound = child.props.test === "*" || child.props.test.test(currentPath);
            }
        }
    });
    // Return the element 
    return element?.props?.render?.() || null;
};

// Export router provider
export const RouterProvider = props => {
    const [currentPath, setCurrentPath] = React.useState(() => {
        return window.location.hash || "#";
    });
    React.useEffect(() => {
        const handleHashChange = () => {
            setCurrentPath(window.location.hash || "");
        };
        window.addEventListener("hashchange", handleHashChange);
        // When app is unmounted, remove hashchange listener
        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);
    return (
        <RouterContext.Provider value={currentPath}>
            {props.children}
        </RouterContext.Provider>
    );
};
