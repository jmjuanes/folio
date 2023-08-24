import React from "react";
import {DrawingIcon} from "@josemi-icons/react";
import {saveAsJson} from "../board/json.js";
import {useClient} from "../contexts/ClientContext.jsx";
import {useRouter} from "../contexts/RouterContext.jsx";
import {useConfirm} from "../contexts/ConfirmContext.jsx";
import {Board} from "./Board.jsx";
import {BoardList} from "./BoardList.jsx";
import {BoardCreate} from "./BoardCreate.jsx";
import {useDebounce, useForceUpdate} from "../hooks/index.js";

// Folio logo
const FolioLogo = props => (
    <div className="cursor-pointer flex items-center gap-2 bg-gray-900 rounded-lg px-3 shadow-sm" onClick={props.onClick}>
        <div className="flex items-center text-2xl text-white">
            <DrawingIcon />
        </div>
        <div className="flex items-center select-none font-crimson text-3xl leading-none">
            <span className="font-black text-white">Folio.</span>
        </div>
    </div>
);

// Board wrapper
const BoardWrapper = props => {
    const client = useClient();
    const {redirect} = useRouter();
    const state = React.useRef({});
    // Use a debounce function to handle state changes
    const saveBoard = useDebounce(250, () => {
        client.updateBoard(props.id, state.current).then(() => {
            // TODO: show board updated message
        });
    });
    return (
        <Board
            key={props.id}
            initialData={() => client.getBoard(props.id)}
            links={[
                {url: process.env.URL_REPOSITORY, text: "About Folio"},
                {url: process.env.URL_ISSUES, text: "Report a bug"},
            ]}
            headerLeftContent={(
                <div className="flex order-first">
                    <FolioLogo onClick={() => redirect("")} />
                </div>
            )}
            showLoad={false}
            onChange={newState => {
                state.current = {
                    ...state.current,
                    ...newState,
                    updatedAt: Date.now(),
                };
                saveBoard();
            }}
            onSave={() => {
                client.getBoard(props.id).then(data => {
                    return saveAsJson(data);
                });
            }}
        />
    );
};

export const App = () => {
    const client = useClient();
    const {currentPath, redirect} = useRouter();
    const [updateKey, forceUpdate] = useForceUpdate();
    const [boardCreateVisible, setBoardCreateVisible] = React.useState(false);
    const {showConfirm} = useConfirm();
    // Check if we are in a board
    if (currentPath.startsWith("#board/")) {
        const boardId = currentPath.replace("#board/", "").trim();
        return (
            <div className="fixed top-0 left-0 h-full w-full bg-white text-base text-gray-700">
                <BoardWrapper id={boardId} />
            </div>
        );
    }
    // Other case, render welcome page
    return (
        <div className="w-full maxw-5xl mx-auto px-6">
            <div className="mt-24 animation-fadein">
                <div className="font-crimson font-black text-9xl leading-none tracking-tight">
                    <span>Folio.</span>
                </div>
                <div className="mt-4 text-xl w-full maxw-xl">
                    Welcome to <b>Folio</b>, our work-in-progress minimal digital whiteboard for sketching and prototyping.
                </div>
            </div>
            <div className="mt-16">
                <BoardList
                    key={updateKey}
                    title="Your boards"
                    loadItems={() => client.getUserBoards()}
                    onCreate={() => setBoardCreateVisible(true)}
                    onBoardClick={boardId => {
                        return redirect(`board/${boardId}`);
                    }}
                    onBoardDelete={boardId => {
                        return showConfirm({
                            title: "Delete board",
                            message: "Are you sure? This action can not be undone.",
                            callback: () => {
                                client.deleteBoard(boardId).then(() => {
                                    forceUpdate();
                                });
                            },
                        });
                    }}
                />
            </div>
            {/* Footer section */}
            <div className="w-full mt-20 mb-20">
                <div className="w-full h-px bg-gray-200 mb-16" />
                <div className="flex flex-col items-center">
                    <div className="text-sm mb-2">
                        <span><b>Folio</b> v{process.env.VERSION}</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                        Designed by <a href="https://www.josemi.xyz" target="_blank" className="underline">Josemi</a> in Valencia, Spain.
                    </div>
                    <div className="text-xs text-gray-600">
                        <span>This site does not track you.</span>
                    </div>
                </div>
            </div>
            {boardCreateVisible && (
                <BoardCreate
                    onSubmit={data => {
                        return client.addBoard(data).then(response => {
                            redirect(`board/${response.id}`);
                            setBoardCreateVisible(false);
                        });
                    }}
                    onCancel={() => setBoardCreateVisible(false)}
                />
            )}
        </div>
    );
};
