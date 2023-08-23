import React from "react";

const RouterContext = React.createContext("");

// Use router hook
export const useRouter = () => {
    const currentPath = React.useContext(RouterContext);
    return {
        currentPath: currentPath,
        redirect: newPath => {
            window.location.hash = newPath;
        },
    };
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
