import React from "react";
import {useMount} from "react-use";
import {createEditor} from "../editor.js";
import {promisifyValue} from "../utils/promises.js";
import {Loading} from "../components/loading.jsx";

// @private Shared editor context
export const EditorContext = React.createContext(null);

// @description use editor hook
export const useEditor = () => {
    return React.useContext(EditorContext)[0];
};

// @description Editor provider component
// @param {object|function|null} initialData Initial data for editor
// @param {function} callback to execute after any change in the editor data
// @param {React Children} children React children to render
export const EditorProvider = ({initialData, onChange, children}) => {
    const [editor, setEditor] = React.useState(null);
    const [update, setUpdate] = React.useState(0);

    // dispatch a change event
    const dispatchChange = React.useCallback(() => {
        editor.updatedAt = Date.now(); // save the last update time
        // return onChange(editor.toJSON());
    }, [editor, onChange]);

    // dispatch an update event
    const dispatchUpdate = React.useCallback(() => {
        setUpdate((-1) * update);
    }, [update, setUpdate]);

    // const [error, setError] = React.useState(null);
    // On mount, import data to create the editor
    // TODO: we would need to handle errors when importing editor data
    useMount(() => {
        promisifyValue(initialData).then(value => {
            return setEditor(createEditor(value || {}));
        });
    });

    // If editor is not available (yet), do not render
    if (!editor) {
        return <Loading />;
    }

    // assign additional editor methods
    editor.dispatchChange = dispatchChange;
    editor.update = dispatchUpdate;

    // Render editor context provider
    return (
        <EditorContext.Provider value={[editor, update]}>
            <div className={"relative overflow-hidden h-full w-full select-none"}>
                {children}
            </div>
        </EditorContext.Provider>
    );
};
