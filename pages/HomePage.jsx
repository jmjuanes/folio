import React from "react";
import {ExclamationTriangleIcon} from "@josemi-icons/react";
import {loadFromJson, saveAsJson} from "../board/json.js";
import {useClient} from "../contexts/ClientContext.jsx";
import {useRouter} from "../contexts/RouterContext.jsx";
import {useConfirm} from "../contexts/ConfirmContext.jsx";
import {BoardList} from "../components/BoardList.jsx";
import {useForceUpdate} from "../hooks/index.js";

export const HomePage = props => {
    const client = useClient();
    const {redirect} = useRouter();
    const [updateKey, forceUpdate] = useForceUpdate();
    const {showConfirm} = useConfirm();

    return (
        <div className="w-full">
            <div className="mt-24 select-none">
                <div className="font-crimson font-black text-9xl leading-none tracking-tight">
                    <span>Folio.</span>
                </div>
            </div>
            <div className="w-full mt-8">
                <div className="rounded-lg p-6 bg-gray-200 border-none border-gray-900 flex gap-4 select-none">
                    <div className="flex text-gray-600 text-4xl animation-pulse">
                        <ExclamationTriangleIcon />
                    </div>
                    <div className="text-gray-900">
                        <div className="font-bold">Folio is still a Work in Progress</div>
                        <div className="mt-1 w-full border-t-2 border-gray-900" />
                        <div className="mt-3 text-sm">You might encounter occasional bugs or experience features that are still being refined. We appreciate your patience and understanding as we work to deliver the best possible drawing experience.</div>
                    </div>
                </div>
            </div>
            <div className="mt-12">
                <BoardList
                    key={updateKey}
                    title="Your boards"
                    data={() => client.getUserBoards()}
                    onCreate={() => redirect("#new")}
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
        </div>
    );
};
