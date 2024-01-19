import React from "react";
import {Alert, AlertIcon, AlertTitle, AlertDescription} from "@josemi-ui/components";
import {ExclamationTriangleIcon} from "@josemi-icons/react";
import {loadFromJson, saveAsJson} from "../board/json.js";
import {useClient} from "../contexts/ClientContext.jsx";
import {useConfirm} from "../contexts/ConfirmContext.jsx";
import {useRouter} from "../contexts/router.jsx";

import {BoardList} from "./components/board-list.jsx";

// Dashboard page
export default props => {
    const client = useClient();
    const {redirect} = useRouter();
    const [updatedAt, setUpdatedAt] = React.useState(0);
    const {showConfirm} = useConfirm();
    return (
        <div className="w-full mt-4">
            <Alert variant="default">
                <AlertIcon className="text-lg animation-pulse">
                    <ExclamationTriangleIcon />
                </AlertIcon>
                <AlertTitle>Folio is still a Work in Progress</AlertTitle>
                <AlertDescription>
                    You might encounter occasional bugs or experience features that are still being refined. 
                    We appreciate your patience and understanding as we work to deliver the best possible drawing experience.
                </AlertDescription>
            </Alert>
            <div className="mt-12">
                <BoardList
                    key={updatedAt}
                    title="Your boards"
                    data={() => client.getUserBoards()}
                    onCreate={() => {
                        Promise.resolve(Date.now())
                            .then(creationDate => {
                                return client.addBoard({
                                    title: "Untitled",
                                    createdAt: creationDate,
                                    updatedAt: creationDate,
                                });
                            })
                            .then(response => redirect(`board/${response.id}`))
                            .catch(error => console.error(error));
                    }}
                    onLoad={() => {
                        loadFromJson()
                            .then(data => client.addBoard(data))
                            .then(response => redirect(`board/${response.id}`))
                            .catch(error => console.error(error));
                    }}
                    onBoardClick={boardId => {
                        redirect(`board/${boardId}`);
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
                                        setUpdatedAt(Date.now());
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
                                setUpdatedAt(Date.now());
                            })
                            .catch(error => console.error(error));
                    }}
                />
            </div>
        </div>
    );
};
