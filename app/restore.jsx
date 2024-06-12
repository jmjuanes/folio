import React from "react";
import {createRoot} from "react-dom/client";
import {LoaderIcon, FileEmptyIcon, EmojiSadIcon} from "@josemi-icons/react";
import {ClientProvider, useClient} from "./contexts/client.jsx";
import {saveAsJson} from "./json.js";

const getFilename = board => {
    return (board.title || "untitled").trim().toLowerCase().replace(/ /g, "");
};

const BackupApp = () => {
    const client = useClient();
    const [loading, setLoading] = React.useState(true);
    const [files, setFiles] = React.useState([]);
    
    // Handle the download of the specified board
    const handleDownload = board => {
        return saveAsJson(board)
            .then(() => console.log("File saved"))
            .catch(error => console.error(error));
    };

    // On init, get client data and allow users to download a .folio file
    React.useEffect(() => {
        // Recover data from storage
        client.recover()
            .then(items => setFiles(items || []))
            .catch(error => {
                console.error(error);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="w-full max-w-5xl mx-auto py-20 text-neutral-900">
            <div className="mb-10">
                <div className="text-6xl mb-4 leading-none">
                    <span className="font-brand">folio.</span>
                    <span className="text-neutral-600 font-medium">backup</span>
                </div>
                <div className="max-w-3xl text-lg">
                    <div className="mb-4">This tool is designed to help you easily export your whiteboards from the current folio storage and save them as <b>.folio</b> files. </div>
                    <div>You can then reimport these files into the new version of folio to ensure a seamless transition without losing any of your important work.</div>
                </div>
            </div>
            {loading && (
                <div className="w-full h-48 flex flex-col justify-center items-center">
                    <div className="flex items-center text-xl text-neutral-700">
                        <div className="flex items-center animation-spin">
                            <LoaderIcon />
                        </div>
                    </div>
                    <div className="text-2xs text-neutral-600">Just one moment</div>
                </div>
            )}
            {!loading && files?.length === 0 && (
                <div className="w-full p-16 rounded-xl border border-neutral-200 flex flex-col items-center justify-center select-none">
                    <div className="flex items-center text-5xl text-neutral-700 mb-1">
                        <EmojiSadIcon />
                    </div>
                    <div className="font-bold">Nothing to export...</div>
                    <div className="text-sm text-neutral-800">We are sorry, but there are no whiteboards to export.</div>
                </div>
            )}
            {!loading && files?.length > 0 && (
                <div className="w-full">
                    <div className="w-full grid grid-cols-5 gap-2 mb-4">
                        {files.map((file, index) => (
                            <div key={index} className="w-full select-none cursor-pointer" onClick={() => handleDownload(file)}>
                                <div className="hover:bg-neutral-100 border border-neutral-200 p-4 rounded-xl">
                                    <div className="flex items-center text-6xl text-neutral-800 mb-1">
                                        <FileEmptyIcon />
                                    </div>
                                    <div className="text-sm font-bold mb-1">{getFilename(file)}.folio</div>
                                    <div className="text-2xs">Created: <b>{(new Date(file.createdAt)).toDateString()}</b></div>
                                    <div className="text-2xs">Last updated: <b>{(new Date(file.updatedAt)).toDateString()}</b></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-neutral-500 select-none">Total boards: {files.length}</div>
                </div>
            )}
            <div className="mt-20">
                <div className="w-full h-px bg-neutral-200 mb-6" />
                <div className="text-xs text-neutral-500">folio.backup <b>v{process.env.VERSION}</b></div>
            </div>
        </div>
    );
};

createRoot(document.getElementById("root")).render((
    <ClientProvider>
        <BackupApp />
    </ClientProvider>
));
