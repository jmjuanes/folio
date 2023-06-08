import React from "react";
import {useBoard} from "../contexts/BoardContext.jsx";

const Item = props => (
    <div className="flex items-center gap-2 rounded-md px-3 py-2 select-none hover:bg-gray-200 cursor-pointer" onClick={props.onClick}>
        <div className="flex items-center text-xs text-gray-700">
            <span>{props.text}</span>
        </div>
    </div>
);

const Separator = () => (
    <div className="bg-gray-200 h-px w-full my-2" />
);

export const ContextMenu = props => {
    const board = useBoard();
    const selectedElements = board.getSelectedElements();
    const x = board.state.contextMenuX;
    const y = board.state.contextMenuY;
    return (
        <div className="absolute" style={{top: y, left: x}}>
            <div className="bg-white shadow-md w-40 p-3 rounded-lg flex flex-col gap-0 border border-gray-300">
                {selectedElements.length > 0 && (
                    <React.Fragment>
                        <Item
                            text="Duplicate"
                            onClick={() => {
                                board.state.contextMenuVisible = false;
                                board.duplicate();
                                props.onChange?.(board.export());
                                board.update();
                            }}
                        />
                        <Separator />
                    </React.Fragment>
                )} 
                {selectedElements.length > 0 && (
                    <React.Fragment>
                        <Item
                            text="Cut"
                            onClick={() => {
                                board.cut().then(() => {
                                    board.state.contextMenuVisible = false;
                                    props.onChange?.(board.export());
                                    board.update();
                                });
                            }}
                        />
                        <Item
                            text="Copy"
                            onClick={() => {
                                board.copy().then(() => {
                                    board.state.contextMenuVisible = false;
                                    board.update();
                                });
                            }}
                        />
                    </React.Fragment>
                )}
                <Item
                    text="Paste"
                    onClick={() => {
                        board.paste(null, {x, y}).then(() => {
                            props.onChange?.(board.export());
                            board.state.contextMenuVisible = false;
                            board.update();
                        });
                    }}
                />
                {board.elements.length > 0 && (
                    <React.Fragment>
                        <Separator />
                        <Item
                            text="Select All"
                            onClick={() => {
                                board.selectAll();
                                board.state.contextMenuVisible = false;
                                board.update();
                            }}
                        />
                    </React.Fragment>
                )}
                {selectedElements.length > 0 && (
                    <React.Fragment>
                        <Separator />
                        <Item
                            text="Delete"
                            onClick={() => {
                                board.state.contextMenuVisible = false;
                                board.remove();
                                props.onChange?.(board.export());
                                board.update();
                            }}
                        />
                    </React.Fragment>
                )} 
            </div>
        </div>
    );
};
