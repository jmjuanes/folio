import React from "react";
import {useBoard} from "../contexts/BoardContext.jsx";

const Item = props => (
    <div className="flex items-center gap-2 rounded-md px-3 py-2 select-none hover:bg-neutral-100 cursor-pointer" onClick={props.onClick}>
        <div className="flex items-center text-xs">
            <span>{props.text}</span>
        </div>
    </div>
);

const Separator = () => (
    <div className="bg-neutral-200 h-px w-full my-1" />
);

export const ContextMenu = props => {
    const board = useBoard();
    const selectedElements = board.getSelectedElements();
    const x = board.state.contextMenuX;
    const y = board.state.contextMenuY;
    const style = {
        top: y,
        left: x,
        transform: y > board.state.canvasHeight / 2 ? "translateY(-100%)" : "",
    };
    return (
        <div className="absolute z-10" style={style}>
            <div className="bg-white shadow-md w-40 p-1 rounded-lg flex flex-col gap-0 border border-neutral-200">
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
                        {selectedElements.some(el => !el.locked) && (
                            <Item
                                text="Lock"
                                onClick={() => {
                                    board.lockElements(selectedElements);
                                    props.onChange?.(board.export());
                                    board.update();
                                }}
                            />
                        )}
                        {selectedElements.some(el => el.locked) && (
                            <Item
                                text="Unlock"
                                onClick={() => {
                                    board.unlockElements(selectedElements);
                                    props.onChange?.(board.export());
                                    board.update();
                                }}
                            />
                        )}
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
                {selectedElements.length > 0 && (
                    <React.Fragment>
                        <Separator />
                        <Item
                            text="Send backward"
                            onClick={() => {
                                board.sendSelectedElementsBackward();
                                props.onChange?.(board.export());
                                board.state.contextMenuVisible = false;
                                board.update();
                            }}
                        />
                        <Item
                            text="Bring forward"
                            onClick={() => {
                                board.bringSelectedElementsForward();
                                props.onChange?.(board.export());
                                board.state.contextMenuVisible = false;
                                board.update();
                            }}
                        />
                        {/*
                        <Item
                            text="Send to back"
                            onClick={() => {
                                board.sendSelectedElementsToBack();
                                props.onChange?.(board.export());
                                board.state.contextMenuVisible = false;
                                board.update();
                            }}
                        />
                        <Item
                            text="Bring to front"
                            onClick={() => {
                                board.bringSelectedElementsToFront();
                                props.onChange?.(board.export());
                                board.state.contextMenuVisible = false;
                                board.update();
                            }}
                        />
                        */}
                    </React.Fragment>
                )}
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
