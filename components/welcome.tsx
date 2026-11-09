import { useCallback, useMemo, useRef, useState } from "react";
import { renderIcon, DrawingIcon, FolderIcon, ClockIcon, FileIcon } from "@josemi-icons/react";
import { Button } from "folio-react/components/ui/button.tsx";
import { loadFromJson } from "folio-react/lib/json.js";
import { useStorage } from "../contexts/storage.tsx";
import type { JSX } from "react";

type RecentDocumentProps = {
    id: string;
    name: string;
};

const RecentDocument = (props: RecentDocumentProps): JSX.Element => (
    <a href="" className="rounded-md border-1 border-gray-200 flex items-center gap-2 cursor-pointer p-2 opacity-60 hover:opacity-80">
        <div className="flex items-center text-lg">
            <FileIcon />
        </div>
        <div className="text-sm font-medium">{props.name}</div>
    </a>
);

export const Welcome = (): JSX.Element => {
    const storage = useStorage();
    const loading = useRef(false);

    // get recent documents from storage
    const recentDocuments = (storage.documents || []).slice(0, 4);

    // handle closing the welcome dialog
    const handleClose = useCallback(() => {
        // if (!loading.current) {
        //     app.dispatch(AppActions.OPEN_LAST_EDITED_DOCUMENT);
        // }
    }, []);

    // handle load board from file
    const handleLoad = useCallback(() => {
        // if (!loading.current) {
        //     loading.current = true;
        //     app.dispatch(AppActions.IMPORT_DOCUMENT).catch((error: any) => {
        //         console.error(error);
        //         loading.current = false;
        //     });
        // }
    }, []);

    // handle start drawing
    const handleCreate = useCallback(() => {
        // if (!loading.current) {
        //     loading.current = true;
        //     app.dispatch(AppActions.CREATE_DOCUMENT).catch((error: any) => {
        //         console.error(error);
        //         loading.current = false;
        //     });
        // }
    }, []);

    return (
        <div className="w-full max-w-xl mx-auto p-6">
            <div className="pb-8 select-none">
                <div className="mb-2 leading-none font-bold text-5xl text-center">
                    <span>Welcome back!</span>
                </div>
                <div className="text-lg text-center">
                    <span>Pick up where you left off, or start something new.</span>
                </div>
            </div>
            <div className="flex items-center gap-2 mb-6">
                <Button className="w-full" onClick={handleCreate}>
                    <div className="flex items-center text-lg">
                        <DrawingIcon />
                    </div>
                    <div className="font-bold">Start drawing</div>
                </Button>
                <Button variant="secondary" className="w-full" onClick={handleLoad}>
                    <div className="flex items-center text-lg">
                        <FolderIcon />
                    </div>
                    <div className="font-medium">Load from file</div>
                </Button>
            </div>
            {recentDocuments.length > 0 && (
                <div className="mt-8">
                    <div className="mb-3 flex items-center gap-1 leading-none opacity-60 text-sm">
                        <div className="flex items-center">
                            <ClockIcon />
                        </div>
                        <div className="font-medium">Recent boards</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {recentDocuments.map(recentDocument => (
                            <RecentDocument
                                key={recentDocument.id}
                                id={recentDocument.id || "-"}
                                name={recentDocument.metadata?.name || "-"}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
