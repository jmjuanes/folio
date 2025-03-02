import React from "react";
import {useMount, useDebounce} from "react-use";
import {createEditor} from "../editor.js";
import {createMemoryStore} from "../store/memory.js";
import {Loading} from "../components/loading.jsx";

// @private Shared editor context
export const EditorContext = React.createContext(null);

// @description use editor hook
export const useEditor = () => {
    return React.useContext(EditorContext)[0];
};

// @description Editor provider component
// @param {object} store store instace for accessing and saving data
// @param {React Children} children React children to render
export const EditorProvider = props => {
    const [editor, setEditor] = React.useState(null);
    const [update, setUpdate] = React.useState(0);
    const [dataToDispatch, setDataToDispatch] = React.useState(null);
    // const [error, setError] = React.useState(null);
    const store = React.useMemo(() => {
        return props.store || createMemoryStore();
    }, [props.store]);

    // debounce saving data into the store
    useDebounce(() => {
        if (dataToDispatch && store?.data) {
            store.data.set(dataToDispatch);
        }
    }, 250, [editor, dataToDispatch, store]);

    // dispatch a change event
    const dispatchDataChange = React.useCallback(() => {
        editor.updatedAt = Date.now(); // save the last update time
        setDataToDispatch(editor.toJSON());
    }, [editor, setDataToDispatch]);

    // dispatch a library change event
    const dispatchLibraryChange = React.useCallback(() => {
        store.library.set(editor.libraryToJSON());
    }, [store, editor]);

    // dispatch an update event
    const dispatchUpdate = React.useCallback(() => {
        setUpdate((-1) * update);
    }, [update, setUpdate]);

    // On mount, import data to create the editor
    // TODO: we would need to handle errors when importing editor data
    useMount(() => {
        store.initialize()
            .then(() => {
                const allPromises = [];
                if (typeof store.data?.get === "function") {
                    allPromises.push(store.data.get());
                }
                if (typeof store.library?.get === "function") {
                    allPromises.push(store.library.get());
                }
                return Promise.all(allPromises);
            })
            .then(([initialData, initialLibrary]) => {
                return setEditor(createEditor(initialData, initialLibrary));
            })
            .catch(error => {
                console.error(error);
            });
    });

    // If editor is not available (yet), do not render
    if (!editor) {
        return <Loading />;
    }

    // assign additional editor methods
    editor.dispatchChange = dispatchDataChange;
    editor.dispatchLibraryChange = dispatchLibraryChange;
    editor.update = dispatchUpdate;
    editor.store = store; // save store object as a reference in the editor

    // Render editor context provider
    return (
        <EditorContext.Provider value={[editor, update]}>
            <div className={"relative overflow-hidden h-full w-full select-none"}>
                {props.children}
            </div>
        </EditorContext.Provider>
    );
};
