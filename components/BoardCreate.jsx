import React from "react";
import {CloseIcon} from "@josemi-icons/react";
import {PrimaryButton} from "./Button.jsx";
import {COVER_COLORS} from "../utils/colors.js";
import classNames from "classnames";

export const BoardCreate = props => {
    const [title, setTitle] = React.useState("");
    const [color, setColor] = React.useState("");
    const handleSubmit = () => {
        if (title && title.length > 0 && color) {
            return props.onSubmit({
                title: title,
                coverColor: color,
                coverImage: null,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        }
    };
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-white flex items-center justify-center">
            <div className="absolute top-0 right-0 mt-12 mr-12 select-none">
                <div className="flex text-7xl text-gray-500 hover:text-gray-900 cursor-pointer" onClick={props.onCancel}>
                    <CloseIcon />
                </div>
            </div>
            <div className="w-full maxw-xl">
                <div className="font-crimson font-black text-7xl text-gray-900 select-none tracking-tight">
                    <span>New Board</span>
                </div>
                {/* Board title */}
                <div className="mt-10">
                    <div className="text-lg text-gray-600 mb-3 select-none">
                        First, let's start giving a name to your new board:
                    </div>
                    <input
                        type="text"
                        placeholder="My New Board..."
                        className="outline-0 p-0 text-gray-900 text-2xl font-bold border-b-2 border-gray-900 border-dashed w-full"
                        onChange={event => setTitle(event?.target?.value || "")}
                    />
                </div>
                {/* Board cover color */}
                <div className={title ? "o-100" : "o-10"}>
                    <div className="mt-10 select-none">
                        <div className="text-lg text-gray-600 mb-3 select-none">
                            Great! Now, let's choose a color for the board cover:
                        </div>
                    </div>
                    <div className="mt-4 w-full flex flex-nowrap justify-between">
                        {Object.entries(COVER_COLORS).map(([colorKey, colorValue]) => (
                            <div className="flex flex-col items-center gap-3 h-24" key={colorKey}>
                                <div
                                    className={classNames({
                                        "cursor-pointer w-16 h-16 rounded-full": true,
                                        "o-50 hover:o-100": color !== colorValue,
                                    })}
                                    style={{
                                        backgroundColor: colorValue,
                                    }}
                                    onClick={() => setColor(colorValue)}
                                />
                                <div className="text-center text-2xs text-gray-500 capitalize">
                                    <span>{colorKey.replace(/([A-Z])/g, " $1")}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Submit button */}
                <div className={title && color ? "o-100" : "o-10"}>
                    <div className="flex w-full mt-20">
                        <PrimaryButton
                            text="Create Board"
                            textClassName="text-sm font-bold"
                            fullWidth={true}
                            disabled={title === ""}
                            onClick={() => handleSubmit()}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

BoardCreate.defaultProps = {
    onSubmit: null,
    onCancel: null,
};
