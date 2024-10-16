import React from "react";
import {AlbumIcon, PlusIcon, UploadIcon} from "@josemi-icons/react";
import {Panel} from "../ui/panel.jsx";
import {themed} from "../../contexts/theme.jsx";
import {useLibraries} from "../../contexts/libraries.jsx";

const EmptyUserLibraries = () => (
    <div className={themed("flex flex-col items-center justify-center gap-1 py-12", "libraries.empty")}>
        <div className="flex items-center text-4xl">
            <AlbumIcon />
        </div>
        <div className="text-center font-bold text-sm">Libraries</div>
        <div className="text-center text-2xs font-medium px-4">Libraries let you to organize and share your elements across boards.</div>
    </div>
);

export const LibrariesPanel = props => {
    const libraries = useLibraries();
    const allLibraries = libraries.getAll();
    return (
        <Panel className={themed("w-72", "libraries", props.className)}>
            <Panel.Header className="">
                <Panel.HeaderTitle>Libraries</Panel.HeaderTitle>
                <div className="flex items-center gap-1">
                    <Panel.HeaderButton onClick={props.onCreate}>
                        <PlusIcon />
                    </Panel.HeaderButton>
                    <Panel.HeaderButton onClick={props.onLoad}>
                        <UploadIcon />
                    </Panel.HeaderButton>
                </div>
            </Panel.Header>
            <Panel.Body className="overflow-y-auto" style={{maxHeight:"calc(100vh - 8rem)"}}>
                {allLibraries.map(library => (
                    <div key={library.id} className="flex items-center gap-2 py-2 px-4">
                        <AlbumIcon />
                        <div className="flex-1">{library.name}</div>
                    </div>
                ))}
                {allLibraries.length === 0 && (
                    <EmptyUserLibraries />
                )}
            </Panel.Body>
        </Panel>
    );
};
