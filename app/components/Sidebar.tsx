import { useEffect, useCallback, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useToggle } from "react-use";
import classNames from "classnames";
import { renderIcon, DotsIcon } from "@josemi-icons/react";
import { Dropdown, DropdownPortalPosition } from "folio-react/components/ui/dropdown.tsx";
// import { useDialog } from "folio-react/contexts/dialogs.tsx";
// import { useConfirm } from "folio-react/contexts/confirm.jsx";
import { useConfiguration } from "../contexts/configuration.tsx";
import { useAppState } from "../contexts/AppState.tsx";
import { useToaster } from "../contexts/toaster.tsx";
import { Logo } from "./Logo.tsx";
// import { RenameDocumentDialog } from "./dialogs/rename-document.tsx";
import { groupByDate, formatDate } from "../utils/dates.ts";

import * as styles from "../styles/components.css";
import { fontSize2xl, fontFamilyHeading } from "folio-react/styles/utilities.css";

import type { JSX, SyntheticEvent } from "react";

type ActionButtonProps = {
    href?: string;
    icon?: string;
    text?: string;
    collapsed?: boolean;
    onClick: (event: SyntheticEvent) => void;
};

// @description action button component (create, import, settings, etc.)
const ActionButton = (props: ActionButtonProps): JSX.Element => (
    <a className={styles.sidebarActionButton} href={props.href} onClick={props.onClick}>
        {props.icon && (
            <div className={styles.sidebarActionButtonIcon}>
                {renderIcon(props.icon)}
            </div>
        )}
        {!props.collapsed && props.text && (
            <div className={styles.sidebarActionButtonText}>{props.text}</div>
        )}
    </a>
);

type DocumentButtonProps = {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
};

const DocumentButton = (props: DocumentButtonProps): JSX.Element => {
    // const { showDialog } = useDialog();
    // const { showConfirm } = useConfirm();
    const { app } = useAppState();
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
    }, [props.id, active, app]);

    const itemClass = classNames(styles.sidebarDocumentButton, {
        [styles.sidebarDocumentButtonActive]: active,
    });

    return (
        <a href={`#${props.id}`} className={itemClass} title={title}>
            <div className={styles.sidebarDocumentButtonContent}>
                <div className={styles.sidebarDocumentButtonContentIcon}>
                    {renderIcon("file")}
                </div>
                <div className={styles.sidebarDocumentButtonContentText}>
                    {title}
                </div>
            </div>
            <Dropdown.Portal
                id="sidebar:document:action"
                position={DropdownPortalPosition.BOTTOM_RIGHT}
                toggleClassName={styles.sidebarDocumentButtonAction}
                toggleRender={() => (
                    <div className={styles.sidebarDocumentButtonActionIcon}>
                        <DotsIcon />
                    </div>
                )}
                contentStyle={{
                    position: "fixed",
                    zIndex: "50",
                }}
                contentRender={() => (
                    <Dropdown className={styles.sidebarDocumentButtonPopover}>
                        <Dropdown.Item as="div" onClick={handleRename}>
                            <Dropdown.Icon icon="edit" />
                            <span>Rename</span>
                        </Dropdown.Item>
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
                        {/*
                        <div className="px-2 py-1 text-gray-500 text-2xs">
                            <div className="">Created <b>{formatDate(props.created_at)}</b>.</div>
                            <div className="">Last edited <b>{formatDate(props.updated_at)}</b>.</div>
                        </div>
                        */}
                    </Dropdown>
                )}
            />
        </a>
    );
};

const Group = ({ title, items }: { title: string, items: any[] }): JSX.Element => (
    <div className={styles.sidebarGroup}>
        <div className={styles.sidebarGroupTitle}>
            <div style={{ flexShrink: "0" }}>{title || ""}</div>
        </div>
        {(items || []).map((item: any, index: number) => (
            <DocumentButton
                key={`document:item:${index}:${item.id}`}
                id={item.id}
                name={item.name}
                created_at={item.created_at}
                updated_at={item.updated_at}
            />
        ))}
    </div>
);

// @description separator for the sidebar
// const Separator = (): React.JSX.Element => (
//     <div className="border-t-1 border-gray-200 w-full shrink-0 my-2" />
// );

// export the sidebar component
export const Sidebar = (): JSX.Element => {
    const { app } = useAppState();
    const [collapsed, toggleCollapsed] = useToggle(false);
    const websiteConfig = useConfiguration();
    const sidebarClass = classNames({
        [styles.sidebar]: true,
        [styles.sidebarCollapsed]: collapsed,
        [styles.sidebarExpanded]: !collapsed,
    });

    // note that this event will not be triggered if the sidebar is collapsed
    const handleToggleCollapsed = useCallback(() => {
        if (collapsed) {
            toggleCollapsed();
        }
    }, [collapsed, toggleCollapsed]);

    // group boards by the updated_at field
    const groups = useMemo(() => {
        return groupByDate(app.documents || [], "updated_at");
    }, [app.documents]);

    return (
        <div className={sidebarClass} onClick={handleToggleCollapsed}>
            <div className={styles.sidebarHeader}>
                <div style={{}}>
                    {!collapsed && (
                        <Logo
                            className={classNames(fontSize2xl, fontFamilyHeading)}
                            style={{
                                letterSpacing: "-0.1rem",
                            }}
                        />
                    )}
                </div>
                <div style={{ flexShrink: "0" }}>
                    <ActionButton
                        onClick={(event: SyntheticEvent) => {
                            event.stopPropagation();
                            toggleCollapsed();
                        }}
                        icon={collapsed ? "sidebar-left-open" : "sidebar-left-close"}
                    />
                </div>
            </div>
            <div className={styles.sidebarBody}>
                <div className={styles.sidebarActionButtons}>
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
                    <Group
                        title="Today"
                        items={groups.today}
                    />
                )}
                {!collapsed && groups.yesterday.length > 0 && (
                    <Group
                        title="Yesterday"
                        items={groups.yesterday}
                    />
                )}
                {!collapsed && groups.thisWeek.length > 0 && (
                    <Group
                        title="This Week"
                        items={groups.thisWeek}
                    />
                )}
                {!collapsed && groups.thisMonth.length > 0 && (
                    <Group
                        title="This Month"
                        items={groups.thisMonth}
                    />
                )}
                {!collapsed && groups.others.length > 0 && (
                    <Group
                        title="Older Boards"
                        items={groups.others}
                    />
                )}
            </div>
            <div className={styles.sidebarFooter}>
                <ActionButton
                    onClick={(event: SyntheticEvent) => {
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
