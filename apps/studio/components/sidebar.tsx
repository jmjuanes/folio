import React from "react";
import { useToggle } from "react-use";
import classNames from "classnames";
import { renderIcon, DrawingIcon, ChevronLeftIcon, ChevronRightIcon } from "@josemi-icons/react";
import { useClient } from "../contexts/client.tsx";
import { useRouter } from "../contexts/router.tsx";
import { BoardLink } from "./board-link.tsx";
import { groupByDate } from "../utils/dates.ts";

// @description logo component
const Logo = (): React.JSX.Element => (
    <div className="sticky top-0 text-3xl leading-none select-none bg-white pt-5 px-3 pb-3">
        <span className="text-gray-950 font-brand select-none">folio.</span>
    </div>
);

// @description action button component (create, import, settings, etc.)
const ActionButton = ({ href, icon, text, onClick }): React.JSX.Element => (
    <a className="flex items-center gap-2 cursor-pointer rounded-md hover:bg-gray-100 px-2 py-1 text-gray-700 hover:text-gray-900" href={href} onClick={onClick}>
        <div className="flex text-base">
            {renderIcon(icon)}
        </div>
        <div className="text-sm font-medium">{text}</div>
    </a>
);

const BoardsGroup = ({ title, boards, onRename, onDelete }): React.JSX.Element => {
    const [hash] = useRouter();
    return (
        <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-gray-600 mb-0 px-2">
                <span>{title || ""}</span>
            </div>
            {(boards || []).map(item => (
                <BoardLink
                    key={`board:item:${item.id}`}
                    board={item}
                    active={hash === item.id}
                    onRename={() => onRename(item.id)}
                    onDelete={() => props.onDelete(item.id)}
                />
            ))}
        </div>
    );
};

// @description render boards list
const BoardsList = ({ boards, onRename, onDelete }): React.JSX.Element => {
    const groups = React.useMemo(() => {
        return groupByDate(boards, "updated_at");
    }, [boards]);

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

const ToggleButton = ({ style, collapsed, onClick }): React.JSX.Element => (
    <div className="absolute left-0 top-half z-50 cursor-pointer" style={style} onClick={onClick}>
        <div className="flex bg-gray-200 text-lg py-2 pr-1 rounded-tr-md rounded-br-md">
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </div>
    </div>
);

// export the sidebar component
export const Sidebar = (props: any): React.JSX.Element => {
    const [collapsed, toggleCollapsed] = useToggle(!!props.defaultCollapsed);
    const client = useClient();
    const sidebarClass = classNames({
        "w-64 h-full bg-white shrink-0 flex-col justify-between border-r-1 border-gray-200": true,
        "flex": !collapsed,
        "hidden": collapsed,
    });

    return (
        <React.Fragment>
            <div className={sidebarClass}>
                <div className="flex flex-col gap-2 h-full overflow-y-auto overflow-x-hidden">
                    <Logo />
                    <div className="flex flex-col gap-4 h-full px-3 select-none">
                        <div className="flex flex-col gap-1 mb-2">
                            <ActionButton href="#" icon="home" text="Home" />
                            <ActionButton
                                onClick={() => props.onBoardCreate()}
                                icon="plus"
                                text="Create a new board"
                            />
                            <ActionButton
                                onClick={() => props.onBoardImport()}
                                icon="upload"
                                text="Import board from file"
                            />
                        </div>
                        <BoardsList
                            boards={props.boards}
                            onRename={props.onBoardRename}
                            onDelete={props.onBoardDelete}
                        />
                    </div>
                </div>
                <div className="px-3 pt-3 pb-3 bg-white">
                    <ActionButton
                        icon="logout"
                        text="Sign out"
                        onClick={() => client.logout()}
                    />
                </div>
            </div>
            <div className="relative h-full">
                <ToggleButton
                    collapsed={collapsed}
                    style={{
                        transform: "translateY(-50%)",
                    }}
                    onClick={toggleCollapsed}
                />
            </div>
        </React.Fragment>
    );
};
