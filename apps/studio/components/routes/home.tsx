import React from "react";
import { Collection } from "folio-server/types/document.ts";
import { FolderIcon, PlusIcon, ClockIcon, ImageSlashIcon, CalendarIcon } from "@josemi-icons/react";
import { Button } from "folio-react/components/ui/button.jsx";
import { useAppState } from "../../contexts/app-state.tsx";
import { getGreetingMessage, formatDate } from "../../utils/dates.ts";
import { useToaster } from "../../contexts/toaster.tsx";

// @description document card component
// it includes a placeholder image and the document name
// @param {String} id - The document ID. Is required to link to the document.
// @param {String} name - The document display name.
// @param {String} updatedAt - The document last updated date.
export const DocumentCard = ({ id, name, updatedAt }): React.JSX.Element => (
    <a href={`#${id}`} className="block relative rounded-lg border-1 border-gray-200 overflow-hidden">
        <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
            <div className="flex text-gray-500 text-3xl">
                <ImageSlashIcon />
            </div>
        </div>
        <div className="p-2 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-1 w-full">
                <div className="font-medium text-sm w-48 truncate shrink-0 py-0">
                    <span>{name || "Untitled"}</span>
                </div>
            </div>
            <div className="opacity-60 text-xs flex items-center gap-1">
                <div className="flex text-sm">
                    <CalendarIcon />
                </div>
                <div>Last edited {formatDate(updatedAt)}</div>
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
            {(documents || []).slice(0, maxRecentDocuments).map((documentItem: any, index: number) => (
                <DocumentCard
                    key={documentItem.id + ":" + index}
                    id={documentItem.id}
                    name={documentItem.name}
                    updatedAt={documentItem.updated_at}
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
        <div className="h-full overflow-y-auto">
            <div className="mx-auto w-full max-w-5xl px-6 py-24">
                <div className="pt-4 pb-12 select-none">
                    <div className="font-bold text-4xl mb-4 text-gray-950 leading-none text-center">
                        <span>{getGreetingMessage()}</span>
                    </div>
                    <div className="max-w-2xl mx-auto text-gray-700 text-center mb-6">
                        <span>Here you can create boards to organize your ideas, tasks, and projects. </span>
                        <span>Use the sidebar to navigate through your boards, or create a new one to get started.</span>
                    </div>
                    <div className="max-w-xl mx-auto flex items-center gap-2">
                        <Button className="w-full" disabled={false} onClick={() => handleDocumentCreate()}>
                            <div className="flex items-center text-lg">
                                <PlusIcon />
                            </div>
                            <div className="font-medium">New Document</div>
                        </Button>
                        <Button variant="secondary" className="w-full" disabled={false} onClick={() => handleDocumentImport()}>
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
                        maxRecentDocuments={9}
                    />
                )}
            </div>
        </div>
    );
};
