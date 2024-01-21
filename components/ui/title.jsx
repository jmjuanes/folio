import React from "react";
import classNames from "classnames";
import {useBoard} from "@components/contexts/board.jsx";

export const Title = props => {
    const inputRef = React.useRef();
    const board = useBoard();
    const [editing, setEditing] = React.useState(false);
    const containerClass = classNames({
        "flex items-center h-10 mt-1 w-56 border-b-2 border-dashed": true,
        "border-transparent": !props.editable,
        "border-neutral-600": props.editable && !editing,
        "border-neutral-900": props.editable && editing,
    });
    const previewClass = classNames({
        "leading-tight px-2 py-1 truncate text-center text-lg w-full": true,
        "text-neutral-700": true,
        "cursor-pointer hover:text-neutral-800": props.editable,
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
        <div className={containerClass}>
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
                    className={classNames({
                        "outline-none font-bold leading-tight text-center text-lg": true,
                        "w-full px-2 py-1 rounded-none": true,
                        "text-neutral-900 bg-transparent": true,
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
    editable: true,
    onChange: null,
};
