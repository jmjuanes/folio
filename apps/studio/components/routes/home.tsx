import React from "react";
import { Collection } from "folio-server/types/document.ts";
import { FolderIcon, PlusIcon, ClockIcon, ImageSlashIcon } from "@josemi-icons/react";
import { Centered } from "folio-react/components/ui/centered.jsx";
import { Button } from "folio-react/components/ui/button.jsx";
import { useAppState } from "../../contexts/app-state.tsx";
import { getGreetingMessage } from "../../utils/dates.ts";
import { useToaster } from "../../contexts/toaster.tsx";

// @description document card component
export const DocumentCard = ({ id, name }): React.JSX.Element => (
    <a href={`#b/${id}`} className="block relative rounded-lg border-1 border-gray-200 overflow-hidden">
        <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
            <div className="flex text-gray-500 text-3xl">
                <ImageSlashIcon />
            </div>
        </div>
        <div className="flex items-center justify-between gap-2 w-full p-2">
            <div className="font-medium text-sm w-32 truncate shrink-0 py-1">
                {name || "Untitled"}
            </div>
        </div>
    </a>
);

// @description render recent documents
const RecentDocuments = ({ documents, maxRecentDocuments }): React.JSX.Element => (
    <div className="mt-2 select-none">
        <div className="flex items-center gap-1 mb-3 text-gray-600">
            <div className="text-base flex">
                <ClockIcon />
            </div>
            <div className="text-xs font-bold">Your recent documents</div>
        </div>
        <div className="w-full grid grid-cols-3 gap-4">
            {(documents || []).slice(0, maxRecentDocuments || 6).map(documentItem => (
                <DocumentCard
                    key={documentItem.id}
                    id={documentItem.id}
                    name={documentItem.name}
                />
            ))}
        </div>
    </div>
);

export const HomeRoute = (): React.JSX.Element => {
    const { app } = useAppState();
    const toaster = useToaster();

    // handle document creation
    const handleDocumentCreate = React.useCallback(() => {
        return app.createDocument(Collection.BOARD, {})
            .then(newBoard => {
                app.refresh();
                app.openBoard(newBoard.id);
            })
            .catch(error => {
                console.error(error);
                toaster.error(error.message || "Error creating board.");
            });
    }, [ app ]);

    // handle document import
    const handleDocumentImport = React.useCallback(() => {
        return app.importDocument()
            .then(newBoard => {
                app.refresh();
                app.openBoard(newBoard.id);
            })
            .catch(error => {
                console.error(error);
                toaster.error(error.message || "Error importing board");
            });
    }, [ app ]);

    return (
        <Centered className="min-h-full bg-white">
            <div className="w-full max-w-4xl px-6 py-20 bg-white border-none border-gray-200 rounded-lg shadow-none">
                <div className="pt-4 pb-12 select-none">
                    <div className="font-bold text-4xl mb-4 text-gray-950 leading-none text-center">
                        <span>{getGreetingMessage()}</span>
                    </div>
                    <div className="max-w-2xl mx-auto text-gray-700 text-center mb-6">
                        <span>Here you can create boards to organize your ideas, tasks, and projects. </span>
                        <span>Use the sidebar to navigate through your boards, or create a new one to get started.</span>
                    </div>
                    <div className="max-w-xl mx-auto flex items-center gap-2">
                        <Button className="w-full" onClick={() => handleDocumentCreate()}>
                            <div className="flex items-center text-lg">
                                <PlusIcon />
                            </div>
                            <div className="font-medium">New Document</div>
                        </Button>
                        <Button variant="secondary" className="w-full" onClick={() => handleDocumentImport()}>
                            <div className="flex items-center text-lg">
                                <FolderIcon />
                            </div>
                            <div className="font-medium">Load from local</div>
                        </Button>
                    </div>
                </div>
                {app?.documents?.length > 0 && (
                    <RecentDocuments
                        documents={app.documents}
                        maxRecentDocuments={6}
                    />
                )}
            </div>
        </Centered>
    );
};
