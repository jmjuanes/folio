import React from "react";
import { createPortal } from "react-dom";
import { ImageSlashIcon, DotsVerticalIcon } from "@josemi-icons/react";
import { Dropdown } from "folio-react/components/ui/dropdown.jsx";
import { useActions } from "../hooks/use-actions.ts";
import { useEventEmitter } from "../hooks/use-events.ts";
import { ACTIONS, EVENT_NAMES } from "../constants.ts";

export type BoardLinkProps = {
    id: string,
    name: string,
};

export const BoardLink = (props: BoardLinkProps): React.JSX.Element => {
    const [actionsMenuOpen, setActionsMenuOpen] = React.useState(false);
    const actionsMenuRef = React.useRef(null);
    const position = React.useRef({});
    const dispatchAction = useActions();
    const dispatchEvent = useEventEmitter();
    const title = props?.name || "Untitled";

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
    // const handleBoardRename = React.useCallback((event: React.SyntheticEvent) => {
    //     event.preventDefault();
    //     setActionsMenuOpen(false);
    //     if (typeof props.onRename === "function") {
    //         props.onRename(event);
    //     }
    // }, [props.onRename, setActionsMenuOpen]);

    // listener to handle board deletion
    // it will close the actions menu and call the onDelete callback if provided
    const handleBoardDelete = React.useCallback((event: React.SyntheticEvent) => {
        event.preventDefault();
        setActionsMenuOpen(false);
        dispatchAction(ACTIONS.DELETE_BOARD, props).then(() => {
            dispatchEvent(EVENT_NAMES.BOARD_ACTION, {
                action: "board:delete",
                id: props.id,
            });
        });
    }, [ setActionsMenuOpen, dispatchAction, dispatchEvent, props.id ]);

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

    return (
        <a href={`#b/${props.id}`} className="block relative rounded-lg border-1 border-gray-200 overflow-hidden">
            <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                <div className="flex text-gray-500 text-3xl">
                    <ImageSlashIcon />
                </div>
            </div>
            <div className="flex items-center justify-between gap-2 w-full p-2">
                <div className="font-medium text-sm w-32 truncate shrink-0 py-1">
                    {title}
                </div>
                <div className="flex items-center rounded-md py-1 hover:bg-gray-100 text-gray-600" onClick={handleActionsMenuClick}>
                    <DotsVerticalIcon />
                </div>
            </div>
            {actionsMenuOpen && createPortal([
                <div key="sidebar:board:action:bg" className="fixed top-0 left-0 right-0 bottom-0 bg-transparent z-50" />,
                <Dropdown key="sidebar:board:action:menu" ref={actionsMenuRef} className="fixed top-0 left-0 z-50" style={position.current}>
                    <Dropdown.Item as="div" onClick={handleBoardDelete}>
                        <Dropdown.Icon icon="trash" />
                        <span>Delete</span>
                    </Dropdown.Item>
                </Dropdown>,
            ], document.body)}
        </a>
    );
};
