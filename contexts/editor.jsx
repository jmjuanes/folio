import React from "react";
import {STATES} from "@lib/constants.js";
import {useScene} from "./scene.jsx";

// @private editor state context
const EditorContext = React.createContext(null);

// @private create a new editor state
const createEditorState = () => {
    const editorState = {
        currentState: STATES.IDLE,
        action: null,

        // @description active tool state
        tool: null,
        toolLocked: false,

        // @description save current selection  
        selection: null,

        // @description editor settings
        settings: {
            grid: false,
            presentationMode: false,
        },

        // @description context menu configuration
        contextMenu: {
            visible: false,
        },
    };
    return editorState;
};

// @public use editor
export const useEditor = () => {
    return React.useContext(EditorContext);
};

// @public editor state provider
export const EditorProvider = ({onChange, children}) => {
    // const update = useUpdate();
    const scene = useScene();
    const editorState = React.useRef(null);

    const dispatchEditorChange = React.useCallback(() => {
        return onChange?.({
            title: scene.title,
            elements: scene.elements,
            assets: scene.assets,
            background: scene.background,
        });
        // update();
    }, []);

    // Initialize editor state
    if (!editorState.current) {
        editorState.current = createEditorState();
    }

    return (
        <EditorContext.Provider value={[editorState.current, dispatchEditorChange]}>
            {children}
        </EditorContext.Provider>
    );
};
