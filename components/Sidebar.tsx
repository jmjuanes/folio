import { useEffect, useCallback, useState, useRef, useMemo } from "react";
import { Link } from "react-router";
import { useToggle } from "react-use";
import classNames from "classnames";
import { renderIcon, DotsIcon } from "@josemi-icons/react";
import { Dropdown, DropdownPortalPosition } from "folio-react/components/ui/dropdown.tsx";
// import { useDialog } from "folio-react/contexts/dialogs.tsx";
// import { useConfirm } from "folio-react/contexts/confirm.jsx";
// import { useConfiguration } from "../contexts/configuration.tsx";
import { useToaster } from "../contexts/Toaster.tsx";
// import { RenameDocumentDialog } from "./dialogs/rename-document.tsx";
import { groupByDate, formatDate } from "../lib/utils/dates.ts";
import type { JSX, SyntheticEvent } from "react";

export type SidebarDocument = {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
};

type ActionButtonProps = {
    href?: string;
    icon?: string;
    text?: string;
    collapsed?: boolean;
    onClick: (event: SyntheticEvent) => void;
};

// @description action button component (create, import, settings, etc.)
const ActionButton = (props: ActionButtonProps): JSX.Element => {
    const actionClass = classNames({
        "h-8 px-2 py-1": true,
        "flex items-center flex-nowrap gap-2 cursor-pointer rounded-md overflow-hidden": true,
        "hover:bg-gray-200 text-gray-700 hover:text-gray-950": true,
    });
    return (
        <a className={actionClass} href={props.href} onClick={props.onClick}>
            {props.icon && (
                <div className="flex text-xl w-6 justify-center shrink-0">
                    {renderIcon(props.icon)}
                </div>
            )}
            {!props.collapsed && props.text && (
                <div className="text-sm font-medium shrink-0">{props.text}</div>
            )}
        </a>
    );
};

type DocumentButtonProps = {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    onDownload: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
};

const DocumentButton = (props: DocumentButtonProps): JSX.Element => {
    // const { showDialog } = useDialog();
    // const { showConfirm } = useConfirm();
    const toaster = useToaster();

    const title = props?.name || "Untitled";
    const active = false; // app.isBoardOpen(props?.id);

    // listener to handle renaming the document
    // it will close the actions menu and call the onRename callback if provided
    const handleRename = useCallback((event: SyntheticEvent) => {
        event.preventDefault();
        // setActionsMenuOpen(false);
        // showDialog({
        //     component: ({ onClose }) => (
        //         <RenameDocumentDialog id={props.id} currentName={props.name} onClose={onClose} />
        //     ),
        //     dialogClassName: "w-full max-w-sm",
        // });
    }, [props.id]);

    // listener to save a local copy of the document
    // it will close the actions menu and execute the save as action
    const handleSaveAs = useCallback((event: SyntheticEvent) => {
        event.preventDefault();
        // setActionsMenuOpen(false);
        // app.downloadDocument(props.id)
        //     .then(() => {
        //         toaster.success("Document saved.");
        //     })
        //     .catch(error => {
        //         console.error(error);
        //         toaster.error(error?.message || "An error occurred while saving the document.");
        //     });
    }, [props.id]);

    // listener to handle duplicating the document
    const handleDuplicate = useCallback((event: SyntheticEvent) => {
        event.preventDefault();
        // setActionsMenuOpen(false);
        // app.duplicateDocument(props.id)
        //     .then((newDocument) => {
        //         app.refresh();
        //         toaster.success(`Duplicate saved as '${newDocument?.name || "Untitled"}'.`);
        //     })
        //     .catch(error => {
        //         console.error(error);
        //         toaster.error(error?.message || "An error occurred while duplicating the document.");
        //     });
    }, [props.id]);

    // listener to handle deletion of a document
    // it will close the actions menu and call the onDelete callback if provided
    const handleDelete = useCallback((event: SyntheticEvent) => {
        event.preventDefault();
        // setActionsMenuOpen(false);
        // showConfirm({
        //     title: "Delete Document",
        //     message: `Are you sure you want to delete this document? This action cannot be undone.`,
        //     confirmText: "Yes, Delete",
        //     callback: () => {
        //         app.deleteDocument(props.id)
        //             .then(() => {
        //                 // if the deleted board is the current one, redirect to the home page
        //                 if (active) {
        //                     app.openHome();
        //                 }
        //                 app.refresh();
        //                 toaster.success("Document deleted successfully.");
        //             })
        //             .catch(error => {
        //                 console.error(error);
        //                 toaster.error(error?.message || "An error occurred while deleting the document.");
        //             });
        //     },
        // });
    }, [props.id, active]);

    const itemClass = classNames({
        "relative group rounded-md w-full flex items-center py-1 px-2": true,
        "bg-gray-200 text-gray-900": active,
        "hover:bg-gray-200 text-gray-600 hover:text-gray-900": !active,
    });
    return (
        <Link to={`/${props.id}`} className={itemClass} title={title}>
            <div className="cursor-pointer flex items-center gap-2 overflow-hidden w-full">
                <div className="text-lg flex items-center text-gray-600 shrink-0">
                    {renderIcon("file")}
                </div>
                <div className="font-medium text-sm w-32 truncate shrink-0">
                    {title}
                </div>
            </div>
            <Dropdown.Portal
                id="sidebar:document:action"
                position={DropdownPortalPosition.BOTTOM_RIGHT}
                toggleClassName="flex items-center cursor-pointer ml-auto"
                toggleRender={() => (
                    <div className="flex items-center p-1 rounded-sm hover:bg-gray-200 text-gray-600">
                        <DotsIcon />
                    </div>
                )}
                contentStyle={{
                    position: "fixed",
                    zIndex: "50",
                }}
                contentRender={() => (
                    <Dropdown className="w-48">
                        {/*
                        <Dropdown.Item as="div" onClick={handleRename}>
                            <Dropdown.Icon icon="edit" />
                            <span>Rename</span>
                        </Dropdown.Item>
                        */}
                        <Dropdown.Item as="div" onClick={handleSaveAs}>
                            <Dropdown.Icon icon="download" />
                            <span>Save a Copy</span>
                        </Dropdown.Item>
                        <Dropdown.Item as="div" onClick={handleDuplicate}>
                            <Dropdown.Icon icon="copy" />
                            <span>Duplicate</span>
                        </Dropdown.Item>
                        <Dropdown.Separator />
                        <Dropdown.Item as="div" onClick={handleDelete}>
                            <Dropdown.Icon icon="trash" />
                            <span>Delete</span>
                        </Dropdown.Item>
                        <Dropdown.Separator />
                        <div className="px-2 py-1 text-gray-500 text-2xs">
                            <div className="">Created <b>{formatDate(props.created_at)}</b>.</div>
                            <div className="">Last edited <b>{formatDate(props.updated_at)}</b>.</div>
                        </div>
                    </Dropdown>
                )}
            />
        </Link>
    );
};

type GroupedDocumentsProps = {
    title: string;
    documents: SidebarDocument[],
    onDocumentDownload: (id: string) => void;
    onDocumentDuplicate: (id: string) => void;
    onDocumentDelete: (id: string) => void;
};

const GroupedDocuments = (props: GroupedDocumentsProps): JSX.Element => (
    <div className="flex flex-col gap-1">
        <div className="text-xs font-bold text-gray-600 mb-0 px-2 flex overflow-hidden">
            <div className="shrink-0">{props.title}</div>
        </div>
        {(props.documents || []).map((item: any, index: number) => (
            <DocumentButton
                key={`document:item:${index}:${item.id}`}
                id={item.id}
                name={item.name}
                created_at={item.created_at}
                updated_at={item.updated_at}
                onDownload={() => props.onDocumentDownload(item.id)}
                onDuplicate={() => props.onDocumentDuplicate(item.id)}
                onDelete={() => props.onDocumentDelete(item.id)}
            />
        ))}
    </div>
);

// @description separator for the sidebar
const Separator = (): JSX.Element => (
    <div className="border-t-1 border-gray-200 w-full shrink-0 my-2" />
);

export type SidebarProps = {
    documents: SidebarDocument[];
    defaultCollapsed: boolean;
    onDocumentDownload: (id: string) => void;
    onDocumentDuplicate: (id: string) => void;
    onDocumentDelete: (id: string) => void;
};

// export the sidebar component
export const Sidebar = (props: SidebarProps): JSX.Element => {
    const [collapsed, toggleCollapsed] = useToggle(props.defaultCollapsed);
    const sidebarClass = classNames({
        "h-full shrink-0 flex flex-col justify-between": true,
        "w-16 cursor-e-resize": collapsed,
        "w-64": !collapsed,
    });

    // note that this event will not be triggered if the sidebar is collapsed
    const handleToggleCollapsed = useCallback(() => {
        if (collapsed) {
            toggleCollapsed();
        }
    }, [collapsed, toggleCollapsed]);

    // group boards by the updated_at field
    const groups = useMemo(() => {
        return groupByDate(props.documents || [], "updated_at");
    }, [props.documents]);

    return (
        <div className={sidebarClass} style={{ transition: "width 0.25s ease-in-out" }} onClick={handleToggleCollapsed}>
            <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
                <div className="sticky z-50 top-0 text-2xl leading-none select-none p-3 flex items-center justify-between flex-nowrap">
                    {/*
                    <div className="text-gray-950 font-brand select-none overflow-hidden">
                        {!collapsed && (
                            <div className="">{websiteConfig.sidebar_title || websiteConfig.title || "folio."}</div>
                        )}
                    </div>
                    */}
                    <div className="shrink-0">
                        <ActionButton
                            onClick={(event: SyntheticEvent) => {
                                event.stopPropagation();
                                toggleCollapsed();
                            }}
                            icon={collapsed ? "sidebar-left-open" : "sidebar-left-close"}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-4 h-full px-3 select-none">
                    <div className="flex flex-col gap-1 mb-2">
                        <ActionButton
                            onClick={(event: SyntheticEvent) => {
                                event.stopPropagation();
                                // app.createDocument(Collection.BOARD, {}).then((board: any) => {
                                //     app.openBoard(board.id);
                                //     app.refresh();
                                // });
                            }}
                            collapsed={collapsed}
                            icon="plus"
                            text="Create Document"
                        />
                        <ActionButton
                            onClick={(event: SyntheticEvent) => {
                                event.stopPropagation();
                                // app.importDocument().then((board: any) => {
                                //     app.openBoard(board.id);
                                //     app.refresh();
                                // });
                            }}
                            collapsed={collapsed}
                            icon="upload"
                            text="Import Document"
                        />
                    </div>
                    {!collapsed && groups.today.length > 0 && (
                        <GroupedDocuments
                            title="Today"
                            documents={groups.today}
                            onDocumentDownload={props.onDocumentDownload}
                            onDocumentDuplicate={props.onDocumentDuplicate}
                            onDocumentDelete={props.onDocumentDelete}
                        />
                    )}
                    {!collapsed && groups.yesterday.length > 0 && (
                        <GroupedDocuments
                            title="Yesterday"
                            documents={groups.yesterday}
                            onDocumentDownload={props.onDocumentDownload}
                            onDocumentDuplicate={props.onDocumentDuplicate}
                            onDocumentDelete={props.onDocumentDelete}
                        />
                    )}
                    {!collapsed && groups.thisWeek.length > 0 && (
                        <GroupedDocuments
                            title="This Week"
                            documents={groups.thisWeek}
                            onDocumentDownload={props.onDocumentDownload}
                            onDocumentDuplicate={props.onDocumentDuplicate}
                            onDocumentDelete={props.onDocumentDelete}
                        />
                    )}
                    {!collapsed && groups.thisMonth.length > 0 && (
                        <GroupedDocuments
                            title="This Month"
                            documents={groups.thisMonth}
                            onDocumentDownload={props.onDocumentDownload}
                            onDocumentDuplicate={props.onDocumentDuplicate}
                            onDocumentDelete={props.onDocumentDelete}
                        />
                    )}
                    {!collapsed && groups.others.length > 0 && (
                        <GroupedDocuments
                            title="Older Boards"
                            documents={groups.others}
                            onDocumentDownload={props.onDocumentDownload}
                            onDocumentDuplicate={props.onDocumentDuplicate}
                            onDocumentDelete={props.onDocumentDelete}
                        />
                    )}
                </div>
            </div>
            <div className="px-3 pt-3 pb-3">
                <ActionButton
                    onClick={(event: React.SyntheticEvent) => {
                        event.stopPropagation();
                        // app.logout();
                    }}
                    collapsed={collapsed}
                    icon="logout"
                    text="Sign out"
                />
            </div>
        </div>
    );
};
