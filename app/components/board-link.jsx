import React from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { renderIcon, DotsIcon } from "@josemi-icons/react";
import { Dropdown } from "folio-react/components/ui/dropdown.jsx";
import { getPropertyByKey } from "../utils/properties.js";

const BoardLinkAction = props => (
    <Dropdown.Item as={props.as || "div"} onClick={props.onClick}>
        <Dropdown.Icon icon={props.icon} />
        <span>{props.text}</span>
    </Dropdown.Item>
);

export const BoardLink = props => {
    const [actionsMenuOpen, setActionsMenuOpen] = React.useState(false);
    const actionsMenuRef = React.useRef(null);
    const position = React.useRef({});
    const hasActions = typeof props.onRename === "function" || typeof props.onDelete === "function";
    const title = React.useMemo(() => {
        return getPropertyByKey(props.board?.properties, "title")?.content?.value || "Untitled";
    }, [props.board.id]);

    // when clicking on the action item, open the actions menu
    // and position it below the clicked item
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
        "bg-gray-100 text-gray-900": props.active || actionsMenuOpen,
        "hover:bg-gray-100 text-gray-600 hover:text-gray-900": !props.active,
    });
    return (
        <a href={`#${props.board.id}`} className={itemClass} title={title}>
            <div className="cursor-pointer flex items-center gap-2">
                <div className="text-lg flex items-center text-gray-600">
                    {renderIcon(props.icon || "file")}
                </div>
                <div className="font-medium text-sm w-32 truncate">{title}</div>
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
                        <BoardLinkAction
                            onClick={event => {
                                event.preventDefault();
                                setActionsMenuOpen(false);
                                props.onRename();
                            }}
                            icon="edit"
                            text="Rename"
                        />
                    )}
                    {typeof props.onDelete === "function" && (
                        <BoardLinkAction
                            onClick={event => {
                                event.preventDefault();
                                setActionsMenuOpen(false);
                                props.onDelete();
                            }}
                            icon="trash"
                            text="Delete"
                        />
                    )}
                </Dropdown>,
            ], document.body)}
        </a>
    );
};

