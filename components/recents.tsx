import { FileIcon } from "@josemi-icons/react";
import { Button } from "folio-react/components/ui/button.tsx";
import { useStorage } from "../contexts/storage.tsx";
import { useNavigate } from "../contexts/router.tsx";
import { getRelativeTimeString } from "../lib/utils/dates.ts";
import type { JSX } from "react";

export const Recents = (): JSX.Element => {
    const storage = useStorage();

    return (
        <div className="w-full max-w-3xl py-16 px-6 mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="leading-none text-3xl font-bold">
                    <span>Recents</span>
                </div>
                <div className="flex items-center">
                    <Button className="">
                        <span className="font-medium">Create</span>
                    </Button>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                {storage.documents.map(entry => (
                    <div className="" key={entry.id}>
                        <a href={"#" + entry.id} className="flex items-center justify-between py-3 cursor-pointer">
                            <div className="flex items-center gap-2 leading-none">
                                <div className="flex items-center text-base">
                                    <FileIcon />
                                </div>
                                <div className="text-sm">{entry.metadata?.name || ""}</div>
                            </div>
                            {entry.metadata?.updated_at && (
                                <div className="text-sm opacity-60 leading-none">
                                    <span>{getRelativeTimeString(entry.metadata.updated_at)}</span>
                                </div>
                            )}
                        </a>
                        <div className="h-px bg-gray-200 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
};
