import React from "react";
import classNames from "classnames";
import {useBoard} from "../contexts/BoardContext.jsx";

const previewStyle = {
    maxWidth: "13rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
};

export const Title = props => {
    const board = useBoard();
    const [editing, setEditing] = React.useState(false);
    return (
        <div className="flex items-center">
            {!editing && (
                <div className="leading-tight px-2 py-2 rounded-md hover:bg-gray-200" onClick={() => setEditing(true)}>
                    <div className="w-full font-bold text-gray-600" style={previewStyle}>
                        <strong>{board.title}</strong>
                    </div>
                </div>
            )}
            {editing && (
                <input
                    type="text"
                    defaultValue={board.title}
                    className={classNames({
                        "outline-none font-bold leading-none": true,
                        "w-56 px-2 py-2 rounded-md": true,
                        "text-gray-800 bg-gray-200": true,
                    })}
                    placeholder="Untitled"
                    onKeyUp={event => (event.key === "Enter") && setEditing(false)}
                    onChange={event => {
                        board.title = event.target?.value || "Untitled";
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
