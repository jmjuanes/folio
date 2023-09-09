import React from "react";
import {DrawingIcon} from "@josemi-icons/react";
import {saveAsJson} from "../board/json.js";
import {useClient} from "../contexts/ClientContext.jsx";
import {useRouter} from "../contexts/RouterContext.jsx";
import {Board} from "../components/Board.jsx";
import {Button} from "../components/Button.jsx";
import {useDebounce} from "../hooks/index.js";

// Board page
export const BoardPage = () => {
    const client = useClient();
    const {currentPath, redirect} = useRouter();
    const [state, setState] = React.useState({});
    const [error, setError] = React.useState(false);
    const id = currentPath.replace("#board/", "").trim();
    // Use a debounce function to handle state changes
    useDebounce(250, [state?.updatedAt], () => {
        if (state?.updatedAt) {
            client.updateBoard(id, state).then(() => {
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
                        <div>We were not able to load the content of board <b>'{id}'</b>.</div>
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
            key={id}
            initialData={() => client.getBoard(id)}
            links={[
                {url: process.env.URL_REPOSITORY, text: "About Folio"},
                {url: process.env.URL_ISSUES, text: "Report a bug"},
            ]}
            headerLeftContent={(
                <a href="#" className="no-underline order-first flex items-center gap-2 bg-gray-900 rounded-lg py-1 px-3 shadow-md">
                    <div className="hidden items-center text-2xl text-white">
                        <DrawingIcon />
                    </div>
                    <div className="flex items-center select-none font-crimson text-3xl leading-none">
                        <span className="font-black leading-none text-white">Folio.</span>
                    </div>
                </a>
            )}
            showLoad={false}
            onChange={newState => {
                return setState(prevState => ({
                    ...prevState,
                    ...newState,
                    updatedAt: Date.now(),
                }));
            }}
            onSave={() => {
                client.getBoard(id)
                    .then(data => saveAsJson(data))
                    .catch(error => console.error(error));
            }}
            onError={() => setError(true)}
        />
    );
};
