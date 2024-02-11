import React from "react";
import {renderIcon, TrashIcon, CheckIcon} from "@josemi-icons/react";
import {useScene} from "@contexts/scene.jsx";

const ActionButton = ({icon, onClick}) => (
    <div className="flex items-center rounded-md hover:bg-neutral-100 cursor-pointer" onClick={onClick}>
        <div className="flex p-2 text-base">
            {renderIcon(icon)}
        </div>
    </div>
);

// @private page item component
const Page = ({title, active, editable, onClick, onDelete}) => (
    <div className="relative group flex items-center hover:bg-neutral-100 rounded-md">
        {active && (
            <div className="absolute flex text-sm pl-2">
                <CheckIcon />
            </div>
        )}
        <div className="cursor-pointer flex items-center gap-2 w-full p-2 ml-6" onClick={onClick}>
            <div className="font-medium text-sm w-40 truncate">{title}</div>
        </div>
        {!active && editable && (
            <div className="hidden group-hover:flex cursor-pointer items-center o-60 hover:o-100" onClick={onDelete}>
                <div className="flex items-center text-lg p-2">
                    <TrashIcon />
                </div>
            </div>
        )}
    </div>
);

export const PagesPanel = props => {
    const scene = useScene();
    const activePage = scene.getActivePage();

    return (
        <div className="w-64 border border-neutral-200 rounded-lg shadow-md bg-white p-0 relative">
            <div className="flex items-center justify-between sticky top-0 p-2 border-b border-neutral-200 h-12">
                <div className="font-medium text-sm">Pages</div>
                {props.editable && (
                    <div className="flex items-center gap-0">
                        <ActionButton icon="plus" onClick={props.onPageCreate} />
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-1 p-1 scrollbar overflow-y-auto" style={{maxHeight: "50vh"}}>
                {scene.pages.map((page, index) => (
                    <Page
                        key={`page:${index}:${page?.id || ""}`}
                        title={page.title}
                        active={page.id === activePage.id}
                        editable={props.editable}
                        onClick={() => props.onChangeActivePage(page)}
                        onDelete={() => props.onPageDelete(page)}
                    />
                ))}
            </div>
        </div>
    );
};
