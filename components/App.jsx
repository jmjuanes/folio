import React from "react";
import {loadFromJson, saveAsJson} from "../board/json.js";
import {useClient} from "../contexts/ClientContext.jsx";
import {useRouter} from "../contexts/RouterContext.jsx";
import {useConfirm} from "../contexts/ConfirmContext.jsx";
import {Board} from "./Board.jsx";
import {BoardList} from "./BoardList.jsx";
import {BoardCreate} from "./BoardCreate.jsx";
import {Button} from "./Button.jsx";
import {useDebounce, useForceUpdate} from "../hooks/index.js";

// Board wrapper
const BoardWrapper = props => {
    const client = useClient();
    const {redirect} = useRouter();
    const [state, setState] = React.useState({});
    const [error, setError] = React.useState(false);
    // Use a debounce function to handle state changes
    useDebounce(250, [state?.updatedAt], () => {
        if (state?.updatedAt) {
            client.updateBoard(props.id, state).then(() => {
                // TODO: show board updated message
            });
        }
    });
    // Display an error message f something went wrong importing board data
    if (error) {
        return (
            <div className="flex justify-center items-center h-full w-full">
                <div className="flex flex-col items-center px-8 w-full maxw-4xl">
                    <div className="text-6xl text-gray-900 text-center">
                        <strong className="font-black">Hmm, something went wrong...</strong>
                    </div>
                    <div className="mt-4 text-center">
                        <div>We were not able to load the content of board <b>'{props.id}'</b>.</div>
                        <div>Please try again or contact us if the problem persists.</div>
                    </div>
                    <div className="flex mt-8 select-none">
                        <Button
                            className="text-white font-bold bg-gray-900 hover:bg-gray-800 rounded-full px-4"
                            text="Return to Home"
                            onClick={() => {
                                return redirect("");
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }
    return (
        <Board
            key={props.id}
            initialData={() => client.getBoard(props.id)}
            links={[
                {url: process.env.URL_REPOSITORY, text: "About Folio"},
                {url: process.env.URL_ISSUES, text: "Report a bug"},
            ]}
            showLoad={false}
            onChange={newState => {
                return setState(prevState => ({
                    ...prevState,
                    ...newState,
                    updatedAt: Date.now(),
                }));
            }}
            onSave={() => {
                client.getBoard(props.id)
                    .then(data => saveAsJson(data))
                    .catch(error => console.error(error));
            }}
            onLogo={() => redirect("")}
            onError={() => setError(true)}
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
        <div className="w-full maxw-6xl mx-auto px-6">
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
                    onLoad={() => {
                        loadFromJson()
                            .then(data => client.addBoard(data))
                            .then(response => {
                                redirect(`board/${response.id}`);
                            })
                            .catch(error => console.error(error));
                    }}
                    onBoardClick={boardId => {
                        return redirect(`board/${boardId}`);
                    }}
                    onBoardSave={boardId => {
                        client.getBoard(boardId)
                            .then(data => saveAsJson(data))
                            .catch(error => console.error(error));
                    }}
                    onBoardDelete={boardId => {
                        showConfirm({
                            title: "Delete board",
                            message: "Are you sure? This action can not be undone.",
                            callback: () => {
                                client.deleteBoard(boardId)
                                    .then(() => {
                                        // TODO: display a confirmation message
                                        forceUpdate();
                                    })
                                    .catch(error => console.error(error));
                            },
                        });
                    }}
                    onBoardDuplicate={boardId => {
                        client.getBoard(boardId)
                            .then(data => {
                                return client.addBoard({
                                    ...data,
                                    title: `${data.title} - Copy`,
                                    createdAt: Date.now(),
                                    updatedAt: Date.now(),
                                });
                            })
                            .then(() => {
                                // TODO: display confirmation message
                                forceUpdate();
                            })
                            .catch(error => console.error(error));
                    }}
                />
            </div>
            {/* Footer section */}
            <div className="w-full pt-20 pb-20">
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
                        client.addBoard(data)
                            .then(response => {
                                redirect(`board/${response.id}`);
                                setBoardCreateVisible(false);
                            })
                            .catch(error => console.error(error));
                    }}
                    onCancel={() => setBoardCreateVisible(false)}
                />
            )}
        </div>
    );
};
