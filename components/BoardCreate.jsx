import React from "react";
import {Modal} from "./Modal.jsx";
import {PrimaryButton, SecondaryButton} from "./Button.jsx";

export const BoardCreate = props => {
    const [title, setTitle] = React.useState("");
    const handleSubmit = () => {
        if (title && title.length > 0) {
            return props.onSubmit({
                title: title,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        }
    };
    return (
        <Modal maxWidth="600px">
            <div className="font-crimson font-black text-6xl mt-8 mb-12 tracking-tight">
                <span>Create board</span>
            </div>
            {/* Title input */}
            <div className="mb-6">
                <div className="font-bold mb-2 text-sm">Board title</div>
                <input
                    className="w-full outline-none rounded-lg border border-gray-300"
                    type="text"
                    placeholder="Your new board..."
                    onChange={event => setTitle(event?.target?.value || "")}
                />
            </div>
            {/* Submit button */}
            <div className="flex gap-2 w-full">
                <PrimaryButton
                    text="Create Board"
                    textClassName="text-sm font-bold"
                    fullWidth={true}
                    disabled={title === ""}
                    onClick={() => handleSubmit()}
                />
                <SecondaryButton
                    text="Cancel"
                    textClassName="text-sm font-bold"
                    fullWidth={true}
                    onClick={() => props.onCancel()}
                />
            </div>
        </Modal>
    );
};

BoardCreate.defaultProps = {
    onSubmit: null,
    onCancel: null,
};
