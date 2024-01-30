import React from "react";
import classNames from "classnames";
import {useBoard} from "@components/contexts/board.jsx";

export const Title = props => {
    const inputRef = React.useRef();
    const board = useBoard();
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
                    <strong>{board.title}</strong>
                </div>
            )}
            {editing && (
                <input
                    ref={inputRef}
                    type="text"
                    defaultValue={board.title}
                    className="outline-none font-bold leading-none w-full p-2 rounded-md text-neutral-900 bg-neutral-100"
                    placeholder="Untitled"
                    onKeyUp={event => (event.key === "Enter") && setEditing(false)}
                    onChange={event => {
                        board.title = (event.target?.value || "Untitled").trim();
                        props?.onChange?.({
                            title: board.title,
                        });
                    }}
                    onBlur={() => setEditing(false)}
                />
            )}
        </div>
    );
};

Title.defaultProps = {
    editable: true,
    onChange: null,
};
