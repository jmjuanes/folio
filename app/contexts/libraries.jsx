import React from "react";
import {useMount} from "react-use";
import {Loading} from "../components/loading.jsx";
import {createLibraryManager} from "../libraries.js";
import {promisifyValue} from "../utils/promises.js";

// @private shared context for user libraries
export const LibrariesContext = React.createContext({});

// Use libraries hook
export const useLibraries = () => {
    return React.useContext(LibrariesContext);
};

// provider for libraries
export const LibrariesProvider = props => {
    const [libraries, setLibraries] = React.useState(null);
    // on mount, import libraries data
    useMount(() => {
        promisifyValue(props.initialData).then(value => {
            if (typeof value === "object" && !!value && Array.isArray(value)) {
                return setLibraries(createLibraryManager(value));
            }
            // Initialize with an empty libraries array
            return setLibraries(createLibraryManager([]));
        });
    });
    // if libraries are not available (yet), do not render
    if (!libraries) {
        return (<Loading />);
    }
    // render libraries context provider
    return (
        <LibrariesContext.Provider value={libraries}>
            {props.children}
        </LibrariesContext.Provider>
    );
};
