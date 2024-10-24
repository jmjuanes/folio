import React from "react";
import {useMount} from "react-use";
import {Loading} from "../components/loading.jsx";
import {createLibrary} from "../library.js";
import {promisifyValue} from "../utils/promises.js";

// @private shared context for user library
export const LibraryContext = React.createContext({});

// Use library hook
export const useLibrary = () => {
    return React.useContext(LibraryContext);
};

// provider for library
export const LibraryProvider = props => {
    const [library, setLibrary] = React.useState(null);
    // on mount, import library data
    useMount(() => {
        promisifyValue(props.initialData).then(value => {
            if (typeof value === "object" && value) {
                return setLibrary(createLibrary(value));
            }
            // Initialize with an empty library
            return setLibrary(createLibrary({}));
        });
    });
    // if library is not available (yet), do not render
    if (!library) {
        return (<Loading />);
    }
    // render library context provider
    return (
        <LibraryContext.Provider value={library}>
            {props.children}
        </LibraryContext.Provider>
    );
};
