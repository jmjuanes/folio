import React from "react";
import { useMount, useDebounce } from "react-use";
import { TOOLS } from "../constants.js";
import { createEditor } from "../lib/editor.js";
import { defaultTools } from "../tools/index.ts";
import { Loading } from "../components/loading.jsx";
import { promisifyValue } from "../utils/promises.js";

export type Editor = any;

export type EditorProviderProps = {
    data?: any;
    tools?: any;
    onChange?: (data: any) => void;
    children: React.ReactNode;
};

// @private Shared editor context
export const EditorContext = React.createContext<[Editor | null, number] | null>(null);

// @description use editor hook
export const useEditor = (): Editor => {
    const editor = React.useContext(EditorContext)?.[0];
    if (!editor) {
        throw new Error("Cannot call 'useEditor' outside <EditorProvider>.");
    }
    return editor;
};

// @description Editor provider component
// @param {object} store store instace for accessing and saving data
// @param {React Children} children React children to render
export const EditorProvider = (props: EditorProviderProps): React.JSX.Element => {
    const [editor, setEditor] = React.useState<Editor | null>(null);
    const [update, setUpdate] = React.useState(0);
    const [dataToDispatch, setDataToDispatch] = React.useState(null);
    const currentPageId = React.useRef<string | null>(null); // track the current page id

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

    // dispatch an update event
    const dispatchUpdate = React.useCallback(() => {
        setUpdate((-1) * update);
    }, [update, setUpdate]);

    // reset the current tool when we change the current page or the readonly state
    React.useEffect(() => {
        if (editor && editor?.page) {
            // case 1: page is now in readonly mode
            if (editor.page.readonly) {
                editor.setCurrentTool(TOOLS.DRAG);
                // const readonlyTools = availableTools.filter(tool => !!tool.enabledOnReadOnly);
                // // check if the current active tool is a readonly tool
                // if (!readonlyTools.some(tool => tool.id === editor.state.tool && readonlyTools.length > 0)) {
                //     editor.setCurrentTool(readonlyTools[0]?.id || TOOLS.SELECT);
                // }
            }
            // case 2: we have changed to a new page
            else if (currentPageId.current !== editor.page.id) {
                editor.setCurrentTool(TOOLS.SELECT);
            }
            // make sure that we update the current page id reference
            currentPageId.current = editor?.page?.id || null;
        }
    }, [editor, editor?.page?.id, editor?.page?.readonly, editor?.activeTool]);

    // On mount, import data to create the editor
    // TODO: we would need to handle errors when importing editor data
    useMount(() => {
        promisifyValue(props.data)
            .then(initialData => {
                setEditor(createEditor({
                    data: initialData,
                    tools: props.tools || defaultTools,
                }));
            })
            .catch(error => {
                console.error(error);
                setEditor(createEditor({}));
            });
    });

    // If editor is not available (yet), do not render
    if (!editor) {
        return <Loading />;
    }

    // assign additional editor methods
    editor.dispatchChange = dispatchDataChange;
    editor.update = dispatchUpdate;

    // Render editor context provider
    return (
        <EditorContext.Provider value={[editor, update]}>
            <div className={"relative overflow-hidden h-full w-full select-none"}>
                {props.children}
            </div>
        </EditorContext.Provider>
    );
};
