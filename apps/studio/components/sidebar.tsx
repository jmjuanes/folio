import React from "react";
import { createPortal } from "react-dom";
import { useToggle } from "react-use";
import classNames from "classnames";
import { renderIcon, DotsIcon } from "@josemi-icons/react";
import { Dropdown } from "folio-react/components/ui/dropdown.jsx";
import { useRouter } from "../contexts/router.tsx";
import { useClient } from "../contexts/client.tsx";
import { useConfiguration } from "../contexts/configuration.tsx";
import { useActions } from "../hooks/use-actions.ts";
import { useEventListener } from "../hooks/use-events.ts";
import { groupByDate } from "../utils/dates.ts";
import { EVENT_NAMES, ACTIONS } from "../constants.ts";

type ActionButtonProps = {
    href?: string;
    icon?: string;
    text?: string;
    collapsed?: boolean;
    onClick?: (event?: React.SyntheticEvent) => void;
};

// @description action button component (create, import, settings, etc.)
const ActionButton = ({ href, icon, text = "", collapsed = false, onClick }: ActionButtonProps): React.JSX.Element => {
    const actionClass = classNames({
        "h-8 px-2 py-1": true,
        "flex items-center flex-nowrap gap-2 cursor-pointer rounded-md overflow-hidden": true,
        "hover:bg-gray-200 text-gray-700 hover:text-gray-950": true,
    });
    return (
        <a className={actionClass} href={href} onClick={onClick}>
            {icon && (
                <div className="flex text-xl w-6 justify-center shrink-0">
                    {renderIcon(icon)}
                </div>
            )}
            {!collapsed && text && (
                <div className="text-sm font-medium shrink-0">{text}</div>
            )}
        </a>
    );
};

type BoardButtonProps = {
    board: {
        id: string,
        attributes: any,
    },
};

const BoardButton = (props: BoardButtonProps): React.JSX.Element => {
    const [ actionsMenuOpen, setActionsMenuOpen ] = React.useState(false);
    const actionsMenuRef = React.useRef(null);
    const position = React.useRef({});
    const [ hash ] = useRouter();
    const dispatchAction = useActions();

    const title = props.board?.attributes?.name || "Untitled";
    const active = hash === `b/${props.board.id}`;

    // when clicking on the action item, open the actions menu
    // and position it below the clicked item
    const handleActionsMenuClick = React.useCallback((event: React.SyntheticEvent) => {
        event.preventDefault();
        if (event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            position.current = {
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
            };
            setActionsMenuOpen(true);
        }
    }, [ setActionsMenuOpen ]);

    // listener to handle board renaming
    // it will close the actions menu and call the onRename callback if provided
    const handleBoardRename = React.useCallback((event: React.SyntheticEvent) => {
        event.preventDefault();
        setActionsMenuOpen(false);
        dispatchAction(ACTIONS.SHOW_RENAME_BOARD_DIALOG, {
            id: props.board.id,
            attributes: props.board.attributes,
        });
    }, [ props.board, setActionsMenuOpen ]);

    // listener to handle board deletion
    // it will close the actions menu and call the onDelete callback if provided
    const handleBoardDelete = React.useCallback((event: React.SyntheticEvent) => {
        event.preventDefault();
        setActionsMenuOpen(false);
        dispatchAction(ACTIONS.DELETE_BOARD, {
            id: props.board.id,
            attributes: props.board.attributes,
        });
    }, [ props.board, setActionsMenuOpen ]);

    React.useEffect(() => {
        if (actionsMenuOpen) {
            const handleClickOutside = (event: Event) => {
                event.preventDefault();
                if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
                    setActionsMenuOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [actionsMenuOpen]);

    const itemClass = classNames({
        "relative group rounded-md w-full flex items-center py-1 px-2": true,
        "bg-gray-200 text-gray-900": active || actionsMenuOpen,
        "hover:bg-gray-200 text-gray-600 hover:text-gray-900": !active,
    });
    return (
        <a href={`#b/${props.board.id}`} className={itemClass} title={title}>
            <div className="cursor-pointer flex items-center gap-2 overflow-hidden w-full">
                <div className="text-lg flex items-center text-gray-600 shrink-0">
                    {renderIcon("file")}
                </div>
                <div className="font-medium text-sm w-32 truncate shrink-0">
                    {title}
                </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex cursor-pointer items-center ml-auto text-base p-0">
                <div className="flex items-center p-1 rounded-sm hover:bg-gray-200 text-gray-600" onClick={handleActionsMenuClick}>
                    <DotsIcon />
                </div>
            </div>
            {actionsMenuOpen && createPortal([
                <div key="sidebar:board:action:bg" className="fixed top-0 left-0 right-0 bottom-0 bg-transparent z-50" />,
                <Dropdown key="sidebar:board:action:menu" ref={actionsMenuRef} className="fixed top-0 left-0 z-50" style={position.current}>
                    <Dropdown.Item as="div" onClick={handleBoardRename}>
                        <Dropdown.Icon icon="edit" />
                        <span>Rename</span>
                    </Dropdown.Item>
                    <Dropdown.Item as="div" onClick={handleBoardDelete}>
                        <Dropdown.Icon icon="trash" />
                        <span>Delete</span>
                    </Dropdown.Item>
                </Dropdown>,
            ], document.body)}
        </a>
    );
};

const Group = ({ title, items }): React.JSX.Element => (
    <div className="flex flex-col gap-1">
        <div className="text-xs font-bold text-gray-600 mb-0 px-2 flex overflow-hidden">
            <div className="shrink-0">{title || ""}</div>
        </div>
        {(items || []).map(item => (
            <BoardButton
                key={`board:${item.id}`}
                board={item}
            />
        ))}
    </div>
);

// @description separator for the sidebar
const Separator = (): React.JSX.Element => (
    <div className="border-t-1 border-gray-200 w-full shrink-0 my-2" />
);

// export the sidebar component
export const Sidebar = (): React.JSX.Element => {
    const [ boards, setBoards ] = React.useState<any[]>(null);
    const eventData = useEventListener<any>(EVENT_NAMES.BOARD_ACTION, null);
    const dispatchAction = useActions();
    const [ collapsed, toggleCollapsed ] = useToggle(false);
    const client = useClient();
    const websiteConfig = useConfiguration();
    const sidebarClass = classNames({
        "h-full bg-gray-50 shrink-0 flex flex-col justify-between border-r-1 border-gray-200": true,
        "w-16 cursor-e-resize": collapsed,
        "w-64": !collapsed,
    });

    // listener to update the boards of the user
    React.useEffect(() => {
        if (!collapsed) {
            dispatchAction(ACTIONS.GET_RECENT_BOARDS, {})
                .then(boards => setBoards(boards))
                .catch(error => {
                    console.error("Error fetching boards:", error);
                });
        }
    }, [ collapsed, eventData?.date, dispatchAction ]);

    // note that this event will not be triggered if the sidebar is collapsed
    const handleToggleCollapsed = React.useCallback(() => {
        if (collapsed) {
            toggleCollapsed();
        }
    }, [ collapsed, toggleCollapsed ]);

    // group boards by the updated_at field
    const groups = React.useMemo(() => {
        return groupByDate(boards || [], "updated_at");
    }, [ boards, boards?.length ]);

    return (
        <div className={sidebarClass} style={{transition: "width 0.25s ease-in-out"}} onClick={handleToggleCollapsed}>
            <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
                <div className="sticky z-50 top-0 text-2xl leading-none select-none bg-gray-50 p-3 flex items-center justify-between flex-nowrap">
                    <div className="text-gray-950 font-brand select-none overflow-hidden">
                        {!collapsed && (
                            <div className="">{websiteConfig.title}</div>
                        )}
                    </div>
                    <div className="shrink-0">
                        <ActionButton
                            onClick={(event: React.SyntheticEvent) => {
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
                            onClick={(event: React.SyntheticEvent) => {
                                event.stopPropagation();
                                dispatchAction(ACTIONS.CREATE_BOARD, {})
                            }}
                            collapsed={collapsed}
                            icon="plus"
                            text="Create a new board"
                        />
                        <ActionButton
                            onClick={(event: React.SyntheticEvent) => {
                                event.stopPropagation();
                                dispatchAction(ACTIONS.IMPORT_BOARD, {})
                            }}
                            collapsed={collapsed}
                            icon="upload"
                            text="Import board from file"
                        />
                        <Separator />
                        <ActionButton
                            onClick={(event: React.SyntheticEvent) => {
                                event.stopPropagation();
                            }}
                            collapsed={collapsed}
                            href="#"
                            icon="home"
                            text="Home"
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
            </div>
            <div className="px-3 pt-3 pb-3 bg-gray-50">
                <ActionButton
                    onClick={(event: React.SyntheticEvent) => {
                        event.stopPropagation();
                        client.logout();
                    }}
                    collapsed={collapsed}
                    icon="logout"
                    text="Sign out"
                />
            </div>
        </div>
    );
};
