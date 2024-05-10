import React from "react";
import classNames from "classnames";

export const Title = props => {
    const title = React.useRef(props.title);
    const inputRef = React.useRef();
    const [editing, setEditing] = React.useState(false);
    const previewClass = classNames({
        "flex items-center leading-none p-2 truncate w-full text-neutral-800 rounded-md": true,
        "cursor-pointer hover:bg-neutral-100": props.editable,
    });

    const handleClick = () => {
        props.editable && setEditing(true);
    };

    React.useEffect(() => {
        if (editing && inputRef?.current) {
            inputRef.current.focus();
        }
    }, [editing]);

    return (
        <div className="flex w-56">
            {!editing && (
                <div className={previewClass} onClick={handleClick}>
                    <strong>{title.current}</strong>
                </div>
            )}
            {editing && (
                <input
                    ref={inputRef}
                    type="text"
                    defaultValue={title.current}
                    className="outline-none font-bold leading-none w-full p-2 rounded-md text-neutral-900 bg-neutral-100"
                    placeholder="Untitled"
                    onKeyUp={event => (event.key === "Enter") && setEditing(false)}
                    onChange={event => {
                        title.current = (event.target?.value || "Untitled").trim();
                        props?.onChange?.(title.current);
                    }}
                    onBlur={() => setEditing(false)}
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
