import React from "react";
import classNames from "classnames";
import { useEditor } from "../contexts/editor.jsx";

export const Title = () => {
    const editor = useEditor();
    const title = editor.title || "Untitled";
    const inputRef = React.useRef();
    const [editing, setEditing] = React.useState(false);
    const editable = true; // TODO: check editor if data is editable
    const previewClass = classNames({
        "flex items-center leading-none p-2 w-full rounded-md": true,
        "text-gray-900 hover:bg-gray-200": editable,
        "cursor-pointer": editable,
    });

    // Automatically focus the input element when the editing state changes to 'true'
    React.useEffect(() => {
        if (editable && editing && inputRef?.current) {
            inputRef.current.focus();
        }
    }, [editable && editing]);

    // handle title change
    const handleChange = React.useCallback(newTitle => {
        // Prevent dispatching a new update if the new title is the same as the prev title
        if (newTitle !== editor.title) {
            editor.title = newTitle;
            editor.dispatchChange();
        }
    }, [editor]);

    return (
        <div className="flex max-w-56">
            {(!editing || !editable) && (
                <div className={previewClass} title={title} onClick={() => setEditing(true)}>
                    <strong className="truncate">{title}</strong>
                </div>
            )}
            {editing && editable && (
                <input
                    ref={inputRef}
                    type="text"
                    defaultValue={title}
                    className="outline-none font-bold leading-none w-full p-2 rounded-md text-gray-900 bg-gray-200"
                    placeholder="Untitled"
                    onKeyUp={event => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            handleChange(event?.target?.value || "Untitled");
                            setEditing(false);
                        }
                    }}
                    onBlur={event => {
                        handleChange(event?.target?.value || "Untitled");
                        setEditing(false);
                    }}
                />
            )}
        </div>
    );
};
