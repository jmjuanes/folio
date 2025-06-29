import React from "react";
import { useMount, useDebounce } from "react-use";
import { createEditor } from "../lib/editor.js";
import { Loading } from "../components/loading.jsx";
import { promisifyValue } from "../utils/promises.js";

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

    // debounce saving data into the store
    useDebounce(() => {
        if (dataToDispatch && typeof props.onChange === "function") {
            props.onChange(dataToDispatch);
        }
    }, 250, [editor, dataToDispatch]);

    // dispatch a change event
    const dispatchDataChange = React.useCallback(() => {
        editor.updatedAt = Date.now(); // save the last update time
        setDataToDispatch(editor.toJSON());
    }, [editor, setDataToDispatch]);

    // dispatch a library change event
    const dispatchLibraryChange = React.useCallback(() => {
        if (typeof props.onLibraryChange === "function") {
            props.onLibraryChange(editor.libraryToJSON());
        }
    }, [editor, props.onLibraryChange]);

    // dispatch an update event
    const dispatchUpdate = React.useCallback(() => {
        setUpdate((-1) * update);
    }, [update, setUpdate]);

    // On mount, import data to create the editor
    // TODO: we would need to handle errors when importing editor data
    useMount(async () => {
        try {
            let initialData = null, initialLibrary = null;
            if (typeof props.data !== "undefined") {
                initialData = await promisifyValue(props.data);
            }
            if (typeof props.library !== "undefined") {
                initialLibrary = await promisifyValue(props.library);
            }
            // initialize editor
            setEditor(createEditor({
                data: initialData,
                library: initialLibrary, 
                preferences: props.preferences || {},
            }));
        }
        catch (error) {
            console.error(error);
        }
    });

    // If editor is not available (yet), do not render
    if (!editor) {
        return <Loading />;
    }

    // assign additional editor methods
    editor.dispatchChange = dispatchDataChange;
    editor.dispatchLibraryChange = dispatchLibraryChange;
    editor.update = dispatchUpdate;
    editor.preferences = props.preferences || {}; // assign preferences

    // Render editor context provider
    return (
        <EditorContext.Provider value={[editor, update]}>
            <div className={"relative overflow-hidden h-full w-full select-none"}>
                {props.children}
            </div>
        </EditorContext.Provider>
    );
};
