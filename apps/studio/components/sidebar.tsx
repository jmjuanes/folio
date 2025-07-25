import React from "react";
import { useToggle } from "react-use";
import classNames from "classnames";
import { renderIcon, DrawingIcon } from "@josemi-icons/react";
import { useClient } from "../contexts/client.tsx";
import { useRouter } from "../contexts/router.tsx";
import { BoardLink } from "./board-link.tsx";
import { groupByDate } from "../utils/dates.ts";

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

const BoardsGroup = ({ title, boards, onRename, onDelete }): React.JSX.Element => {
    const [hash] = useRouter();
    return (
        <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-gray-600 mb-0 px-2 flex overflow-hidden">
                <div className="shrink-0">{title || ""}</div>
            </div>
            {(boards || []).map(item => (
                <BoardLink
                    key={`board:item:${item.id}`}
                    board={item}
                    active={hash === item.id}
                    onRename={() => onRename(item.id)}
                    onDelete={() => onDelete(item.id)}
                />
            ))}
        </div>
    );
};

// @description render boards list
const BoardsList = ({ boards, onRename, onDelete }): React.JSX.Element => {
    const groups = React.useMemo(() => {
        return groupByDate(boards, "updated_at");
    }, [boards, boards.length]);

    return (
        <React.Fragment>
            {groups.today.length > 0 && (
                <BoardsGroup
                    title="Today"
                    boards={groups.today}
                    onRename={onRename}
                    onDelete={onDelete}
                />
            )}
            {groups.yesterday.length > 0 && (
                <BoardsGroup
                    title="Yesterday"
                    boards={groups.yesterday}
                    onRename={onRename}
                    onDelete={onDelete}
                />
            )}
            {groups.thisWeek.length > 0 && (
                <BoardsGroup
                    title="This Week"
                    boards={groups.thisWeek}
                    onRename={onRename}
                    onDelete={onDelete}
                />
            )}
            {groups.thisMonth.length > 0 && (
                <BoardsGroup
                    title="This Month"
                    boards={groups.thisMonth}
                    onRename={onRename}
                    onDelete={onDelete}
                />
            )}
            {groups.others.length > 0 && (
                <BoardsGroup
                    title="Older Boards"
                    boards={groups.others}
                    onRename={onRename}
                    onDelete={onDelete}
                />
            )}
            {(boards || []).length === 0 && (
                <div className="bg-gray-50 rounded-lg p-6 border-0 border-gray-200">
                    <div className="flex items-center justify-center text-gray-700 text-3xl mb-1">
                        <DrawingIcon />
                    </div>
                    <div className="text-center font-bold text-gray-700 text-sm mb-1">
                        <span>No boards available</span>
                        </div> 
                    <div className="text-center text-xs text-gray-500">
                        <span>Your created boards will be displayed here.</span>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

// export the sidebar component
export const Sidebar = (props: any): React.JSX.Element => {
    const [collapsed, toggleCollapsed] = useToggle(!!props.defaultCollapsed);
    const client = useClient();
    const sidebarClass = classNames({
        "h-full bg-gray-50 shrink-0 flex flex-col justify-between border-r-1 border-gray-200": true,
        "w-16": collapsed,
        "w-64": !collapsed,
    });

    return (
        <div className={sidebarClass} style={{transition: "width 0.25s ease-in-out"}}>
            <div className="flex flex-col gap-2 h-full overflow-y-auto overflow-x-hidden">
                <div className="sticky z-50 top-0 text-3xl leading-none select-none bg-gray-50 py-5 px-3 flex items-center justify-between">
                    <div className="text-gray-950 font-brand select-none shrink-0 overflow-hidden">
                        {!collapsed && (<span>folio.</span>)}
                    </div>
                    <div className="shrink-0">
                        <ActionButton
                            onClick={() => toggleCollapsed()}
                            icon={collapsed ? "sidebar-left-open" : "sidebar-left-close"}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-4 h-full px-3 select-none">
                    <div className="flex flex-col gap-1 mb-2">
                        <ActionButton collapsed={collapsed} href="#" icon="home" text="Home" />
                        <ActionButton
                            onClick={() => props.onBoardCreate()}
                            collapsed={collapsed}
                            icon="plus"
                            text="Create a new board"
                        />
                        <ActionButton
                            onClick={() => props.onBoardImport()}
                            collapsed={collapsed}
                            icon="upload"
                            text="Import board from file"
                        />
                    </div>
                    {!collapsed && (
                        <BoardsList
                            boards={props.boards}
                            onRename={props.onBoardRename}
                            onDelete={props.onBoardDelete}
                        />
                    )}
                </div>
            </div>
            <div className="px-3 pt-3 pb-3 bg-gray-50">
                <ActionButton
                    onClick={() => client.logout()}
                    collapsed={collapsed}
                    icon="logout"
                    text="Sign out"
                />
            </div>
        </div>
    );
};
