import React from "react";
import {DEFAULT_TITLE} from "../../constants.js";

export const Title = props => {
    const [editing, setEditing] = React.useState(false);
    const inputRef = React.useRef(null);

    React.useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing]);

    return (
        <React.Fragment>
            {!editing && (
                <div className="cursor:pointer text:lg" onClick={() => setEditing(true)}>
                    <strong>{props.value || DEFAULT_TITLE}</strong>
                </div>
            )}
            {editing && (
                <input
                    ref={inputRef}
                    type="text"
                    className="bg:transparent b:none text:lg font:bold text:center outline:0 p:0"
                    defaultValue={props.value}
                    onChange={event => props?.onChange?.(event.target.value || "")}
                    onBlur={() => setEditing(false)}
                />
            )}
        </React.Fragment>
    );
};

Title.defaultProps = {
    value: DEFAULT_TITLE,
    onChange: null,
};
