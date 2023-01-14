import React from "react";

export const Title = props => {
    const [editing, setEditing] = React.useState(false);

    return (
        <React.Fragment>
            {!editing && (
                <div className="cursor:pointer text:lg" onClick={() => setEditing(false)}>
                    <strong>{props.value || "Untitled"}</strong>
                </div>
            )}
            {editing && (
                <input
                    type="text"
                    className="bg:transparent b:none text:lg outline:0 p:0"
                    defaultValue={props.value}
                />
            )}
        </React.Fragment>
    );
};

Title.defaultProps = {
    value: "Untitled",
    onChange: null,
};
