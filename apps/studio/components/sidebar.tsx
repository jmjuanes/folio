import React from "react";
import { useToggle } from "react-use";
import classNames from "classnames";
import { renderIcon } from "@josemi-icons/react";
import { useClient } from "../contexts/client.tsx";
import { useConfiguration } from "../contexts/configuration.tsx";
import { useActions } from "../hooks/use-actions.ts";
import { ACTIONS } from "../constants.ts";

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

// @description separator for the sidebar
const Separator = (): React.JSX.Element => (
    <div className="border-t-1 border-gray-200 w-full shrink-0 my-4" />
);

// export the sidebar component
export const Sidebar = (): React.JSX.Element => {
    const dispatchAction = useActions();
    const [ collapsed, toggleCollapsed ] = useToggle(false);
    const client = useClient();
    const websiteConfig = useConfiguration();
    const sidebarClass = classNames({
        "h-full bg-gray-50 shrink-0 flex flex-col justify-between border-r-1 border-gray-200": true,
        "w-16 cursor-e-resize": collapsed,
        "w-64": !collapsed,
    });

    // note that this event will not be triggered if the sidebar is collapsed
    const handleToggleCollapsed = React.useCallback(() => {
        if (collapsed) {
            toggleCollapsed();
        }
    }, [ collapsed, toggleCollapsed ]);

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
