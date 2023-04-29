import React from "react";
import {useBoard} from "../../contexts/BoardContext.jsx";

const ContextMenuItem = props => (
    <div className="d-flex items-center gap-2 r-md px-3 py-2 select-none bg-gray-200:hover cursor-pointer" onClick={props.onClick}>
        <div className="d-flex items-center text-sm text-gray-700">
            <span>{props.text}</span>
        </div>
    </div>
);

const ContextMenuSeparator = () => (
    <div className="bg-gray-200 h-px w-full my-2" />
);

const ContextMenuContent = props => {
    const board = useBoard();
    const selectedElements = board.getSelectedElements();

    return (
        <div className="bg-white shadow-md w-40 p-3 r-lg d-flex flex-col gap-0 b-1 b-gray-300 b-solid">
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <ContextMenuItem
                        text="Duplicate"
                        onClick={() => {
                            board.appState.contextMenuVisible = false;
                            // board.removeSelectedElements();
                            board.update();
                        }}
                    />
                    <ContextMenuSeparator />
                </React.Fragment>
            )} 
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <ContextMenuItem
                        text="Cut"
                        onClick={() => {}}
                    />
                    <ContextMenuItem
                        text="Copy"
                        onClick={() => {}}
                    />
                </React.Fragment>
            )}
            <ContextMenuItem
                text="Paste"
                onClick={() => {}}
            />
            {board.elements.length > 0 && (
                <React.Fragment>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        text="Select All"
                        onClick={() => {
                            board.selectAllElements();
                            board.appState.contextMenuVisible = false;
                            board.update();
                        }}
                    />
                    {selectedElements.length > 0 && (
                        <ContextMenuItem
                            text="Select None"
                            onClick={() => {
                                board.clearSelectedElements();
                                board.appState.contextMenuVisible = false;
                                board.update();
                            }}
                        />
                    )}
                </React.Fragment>
            )}
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        text="Delete"
                        onClick={() => {
                            board.appState.contextMenuVisible = false;
                            board.removeSelectedElements();
                            board.update();
                        }}
                    />
                </React.Fragment>
            )} 
        </div>
    );
};

export const ContextMenu = props => {
    const targetRef = React.useRef(null);
    const [_, forceUpdate] = React.useReducer(x => x + 1, 0);
    const board = useBoard();
    const {contextMenuX, contextMenuY} = board.appState;
    const handleContextMenu = event => {
        event.preventDefault();
        event.stopPropagation();

        if (!board.activeTool && !board.activeAction) {
            const {top, left} = targetRef.current.getBoundingClientRect();
            // Enable context menu in app
            board.appState.contextMenuVisible = true;
            board.appState.contextMenuX = event.nativeEvent.clientX - left;
            board.appState.contextMenuY = event.nativeEvent.clientY - top;
            forceUpdate();
        }

        // Prevent displaying default context menu
        return false;
    };

    return (
        <div ref={targetRef} className="position-relative w-full h-full" onContextMenu={handleContextMenu} style={props.style}>
            {props.children}
            {board.appState.contextMenuVisible && (
                <div className="position-absolute" style={{top: contextMenuY, left: contextMenuX}}>
                    <ContextMenuContent />
                </div>
            )}
        </div>
    );
};

ContextMenu.defaultProps = {
    style: {
        touchAction: "none",
        userSelect: "none",
    },
};
