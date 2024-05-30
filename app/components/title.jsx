import React from "react";
import classNames from "classnames";
import {useScene} from "../contexts/scene.jsx";

export const Title = ({editable = false, onChange = null}) => {
    const scene = useScene();
    const title = scene.title || "Untitled";
    const inputRef = React.useRef();
    const [editing, setEditing] = React.useState(false);
    const previewClass = classNames({
        "flex items-center leading-none p-2 w-full text-neutral-800 rounded-md": true,
        "cursor-pointer hover:bg-neutral-100": editable,
    });
    // Automatically focus the input element when the editing state changes to 'true'
    React.useEffect(() => {
        if (editable && editing && inputRef?.current) {
            inputRef.current.focus();
        }
    }, [editable && editing]);
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
                    className="outline-none font-bold leading-none w-full p-2 rounded-md text-neutral-900 bg-neutral-100"
                    placeholder="Untitled"
                    onKeyUp={event => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            onChange?.(event?.target?.value || "Untitled");
                            setEditing(false);
                        }
                    }}
                    onBlur={event => {
                        onChange?.(event?.target?.value || "Untitled");
                        setEditing(false);
                    }}
                />
            )}
        </div>
    );
};

Title.defaultProps = {
    title: "",
    editable: true,
    onChange: null,
};
