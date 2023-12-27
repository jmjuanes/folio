import React from "react";
import Rouct from "rouct";
import {Button} from "@josemi-ui/components";
import {ArrowLeftIcon} from "@josemi-icons/react";
import {saveAsJson} from "../board/json.js";
import {useClient} from "../contexts/ClientContext.jsx";
import {Board} from "../components/Board.jsx";
import {Loading} from "../components/Loading.jsx";
import {useDebounce} from "../hooks/index.js";

// Display an error message
const ErrorContent = () => (
    <div className="flex justify-center items-center h-screen w-full">
        <div className="flex flex-col items-center px-8 w-full maxw-4xl">
            <div className="text-5xl text-neutral-900 text-center">
                <strong className="font-black">Hmm, something went wrong {":("}</strong>
            </div>
            <div className="mt-2 text-center text-neutral-600">
                <div>We were not able to load the content of this board.</div>
                <div>Please try again or contact us if the problem persists.</div>
            </div>
            <div className="flex mt-4 select-none">
                <Button onClick={() => Rouct.redirect("/dashboard")}>
                    <strong>Return to Dashboard</strong>
                </Button>
            </div>
        </div>
    </div>
);

const GoBackButton = props => (
    <div className="cursor-pointer order-first flex items-center rounded-lg py-1 px-2 hover:bg-neutral-100" {...props}>
        <div className="flex items-center text-xl text-neutral-900">
            <ArrowLeftIcon />
        </div>
    </div>
);

// Board page
export default props => {
    const client = useClient();
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
    // Check if client is not ready
    if (!client) {
        return <Loading />;
    }
    // Display an error message if something went wrong importing board data
    if (error || !props.id) {
        return (
            <ErrorContent key={props.id} />
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
            headerLeftContent={(
                <React.Fragment>
                    <GoBackButton onClick={() => Rouct.redirect("/dashboard")} />
                </React.Fragment>
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
                client.getBoard(props.id)
                    .then(data => saveAsJson(data))
                    .catch(error => console.error(error));
            }}
            onError={() => setError(true)}
        />
    );
};
