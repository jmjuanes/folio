import React from "react";
import {AlbumIcon} from "@josemi-icons/react";
import {Panel} from "../ui/panel.jsx";
import {themed} from "../../contexts/theme.jsx";

const EmptyUserLibraries = () => (
    <div className={themed("flex flex-col items-center justify-center gap-1 p-3 rounded-lg", "libraries.empty")}>
        <div className="flex items-center text-4xl">
            <AlbumIcon />
        </div>
        <div className="text-center font-bold text-sm">Libraries</div>
        <div className="text-center text-xs font-medium">Libraries let you to organize and share your elements across boards.</div>
    </div>
);

export const LibrariesPanel = props => {
    return (
        <Panel className={themed("w-72", "libraries", props.className)}>
            <Panel.Header className="">
                <Panel.HeaderTitle>Libraries</Panel.HeaderTitle>
            </Panel.Header>
            <Panel.Body className="overflow-y-auto" style={{maxHeight:"calc(100vh - 8rem)"}}>
                <EmptyUserLibraries />
            </Panel.Body>
        </Panel>
    );
};
