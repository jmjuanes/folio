import React from "react";
import {createPortal} from "react-dom";
import {useToggle} from "react-use";
import classNames from "classnames";
import {renderIcon, FileIcon, DrawingIcon, DotsIcon} from "@josemi-icons/react";
import {ChevronLeftIcon, ChevronRightIcon} from "@josemi-icons/react";
import {Dropdown} from "folio-react/components/ui/dropdown.jsx";
import {useClient} from "../contexts/client.jsx";
import {useRouter} from "../contexts/router.jsx";

// @description logo component
const Logo = () => (
    <div className="sticky top-0 tracking-tighter text-3xl leading-none select-none bg-white pt-5 px-3 pb-3">
        <span className="text-gray-950 font-serif font-bold">folio.</span>
    </div>
);

// @description action button component (create, import, settings, etc.)
const ActionButton = props => (
    <a className="flex items-center gap-2 cursor-pointer rounded-md hover:bg-gray-100 px-2 py-1 text-gray-700 hover:text-gray-900" href={props.href} onClick={props.onClick}>
        <div className="flex text-base">
            {renderIcon(props.icon)}
        </div>
        <div className="text-sm font-medium">{props.text}</div>
    </a>
);

// @description sidebar board item
const BoardItem = props => {
    const [actionsMenuOpen, setActionsMenuOpen] = React.useState(false);
    const actionsMenuRef = React.useRef(null);
    const position = React.useRef({});

    // when clicking on the action item
    const handleActionsMenuClick = React.useCallback(event => {
        event.preventDefault();
        if (event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            position.current = {
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
            };
            setActionsMenuOpen(true);
        }
    }, [setActionsMenuOpen]);

    const handleRename = React.useCallback(() => {
        setActionsMenuOpen(false);
        props.onRename();
    }, [props.onRename, setActionsMenuOpen]);

    const handleDelete = React.useCallback(() => {
        setActionsMenuOpen(false);
        props.onDelete();
    }, [props.onDelete, setActionsMenuOpen]);

    React.useEffect(() => {
        if (actionsMenuOpen) {
            const handleClickOutside = event => {
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
        "bg-gray-100 text-gray-900": props.active,
        "hover:bg-gray-100 text-gray-600 hover:text-gray-900": !props.active,
    });
    return (
        <a href={`#${props.board.id}`} className={itemClass} title={props.board.name}>
            <div className="cursor-pointer flex items-center gap-2">
                <div className="text-lg flex items-center text-gray-600">
                    <FileIcon />
                </div>
                <div className="font-medium text-sm w-32 truncate">{props.board.name}</div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex cursor-pointer items-center ml-auto text-base p-0">
                <div className="flex items-center p-1 rounded-sm hover:bg-gray-200 text-gray-600" onClick={handleActionsMenuClick}>
                    <DotsIcon />
                </div>
            </div>
            {actionsMenuOpen && createPortal([
                <div key="sidebar:board:action:bg" className="fixed top-0 left-0 right-0 bottom-0 bg-transparent z-50" />,
                <Dropdown key="sidebar:board:action:menu" ref={actionsMenuRef} className="fixed top-0 left-0 z-50" style={position.current}>
                    <Dropdown.Item onClick={handleRename}>
                        <Dropdown.Icon icon="edit" />
                        <span>Rename</span>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleDelete}>
                        <Dropdown.Icon icon="trash" />
                        <span>Delete</span>
                    </Dropdown.Item>
                </Dropdown>,
            ], document.body)}
        </a>
    );
};

// @description render boards list
const BoardsList = props => {
    const [hash] = useRouter();
    return (
        <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-gray-600 mb-0 px-2">
                <span>Private Boards</span>
            </div>
            {(props.boards || []).map(item => (
                <BoardItem
                    key={`board:item:${item.id}`}
                    board={item}
                    active={hash === item.id}
                    onRename={() => {
                        props.onRename(item.id);
                    }}
                    onDelete={() => {
                        props.onDelete(item.id)
                    }}
                />
            ))}
            {props.boards.length === 0 && (
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
        </div>
    );
};

const ToggleButton = props => (
    <div className="absolute left-0 top-half z-50 cursor-pointer" style={props.style} onClick={props.onClick}>
        <div className="flex bg-gray-200 text-lg py-2 pr-1 rounded-tr-md rounded-br-md">
            {props.collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </div>
    </div>
);

// export the sidebar component
export const Sidebar = props => {
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
