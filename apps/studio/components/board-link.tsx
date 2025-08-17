import React from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { renderIcon, DotsIcon } from "@josemi-icons/react";
import { Dropdown } from "folio-react/components/ui/dropdown.jsx";

export type BoardLinkProps = {
    board: any,
    active?: boolean,
    onRename?: (event?: React.SyntheticEvent) => void;
    onDelete?: (event?: React.SyntheticEvent) => void;
};

export const BoardLink = (props: BoardLinkProps): React.JSX.Element => {
    const [actionsMenuOpen, setActionsMenuOpen] = React.useState(false);
    const actionsMenuRef = React.useRef(null);
    const position = React.useRef({});
    const hasActions = typeof props.onRename === "function" || typeof props.onDelete === "function";
    const title = props.board?.name || "Untitled";

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
    }, [setActionsMenuOpen]);

    // listener to handle board renaming
    // it will close the actions menu and call the onRename callback if provided
    const handleBoardRename = React.useCallback((event: React.SyntheticEvent) => {
        event.preventDefault();
        setActionsMenuOpen(false);
        if (typeof props.onRename === "function") {
            props.onRename(event);
        }
    }, [props.onRename, setActionsMenuOpen]);

    // listener to handle board deletion
    // it will close the actions menu and call the onDelete callback if provided
    const handleBoardDelete = React.useCallback((event: React.SyntheticEvent) => {
        event.preventDefault();
        setActionsMenuOpen(false);
        if (typeof props.onDelete === "function") {
            props.onDelete(event);
        }
    }, [props.onDelete, setActionsMenuOpen]);

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
        "bg-gray-200 text-gray-900": props.active || actionsMenuOpen,
        "hover:bg-gray-200 text-gray-600 hover:text-gray-900": !props.active,
    });
    return (
        <a href={`#${props.board._id}`} className={itemClass} title={title}>
            <div className="cursor-pointer flex items-center gap-2 overflow-hidden w-full">
                <div className="text-lg flex items-center text-gray-600 shrink-0">
                    {renderIcon("file")}
                </div>
                <div className="font-medium text-sm w-32 truncate shrink-0">
                    {title}
                </div>
            </div>
            {hasActions && (
                <div className="opacity-0 group-hover:opacity-100 flex cursor-pointer items-center ml-auto text-base p-0">
                    <div className="flex items-center p-1 rounded-sm hover:bg-gray-200 text-gray-600" onClick={handleActionsMenuClick}>
                        <DotsIcon />
                    </div>
                </div>
            )}
            {actionsMenuOpen && createPortal([
                <div key="sidebar:board:action:bg" className="fixed top-0 left-0 right-0 bottom-0 bg-transparent z-50" />,
                <Dropdown key="sidebar:board:action:menu" ref={actionsMenuRef} className="fixed top-0 left-0 z-50" style={position.current}>
                    {typeof props.onRename === "function" && (
                        <Dropdown.Item as="div" onClick={handleBoardRename}>
                            <Dropdown.Icon icon="edit" />
                            <span>Rename</span>
                        </Dropdown.Item>
                    )}
                    {typeof props.onDelete === "function" && (
                        <Dropdown.Item as="div" onClick={handleBoardDelete}>
                            <Dropdown.Icon icon="trash" />
                            <span>Delete</span>
                        </Dropdown.Item>
                    )}
                </Dropdown>,
            ], document.body)}
        </a>
    );
};
