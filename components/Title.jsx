import React from "react";
import classNames from "classnames";
import {useBoard} from "../contexts/BoardContext.jsx";

const previewStyle = {
    maxWidth: "13rem",
    minWidth: "13rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
};

export const Title = props => {
    const inputRef = React.useRef();
    const board = useBoard();
    const [editing, setEditing] = React.useState(false);
    React.useEffect(() => {
        if (editing && inputRef?.current) {
            inputRef.current.focus();
        }
    }, [editing]);
    return (
        <div className="flex items-center">
            {!editing && (
                <div className="cursor-pointer leading-tight px-2 py-2 rounded-md hover:bg-gray-200" onClick={() => setEditing(true)}>
                    <div className="w-full font-bold text-gray-900" style={previewStyle}>
                        <strong>{board.title}</strong>
                    </div>
                </div>
            )}
            {editing && (
                <input
                    ref={inputRef}
                    type="text"
                    defaultValue={board.title}
                    className={classNames({
                        "outline-none font-bold leading-none": true,
                        "w-56 px-2 py-2 rounded-md": true,
                        "text-white bg-gray-900": true,
                    })}
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
    onChange: null,
};
