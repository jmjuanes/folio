import React from "react";
import {useToggle} from "react-use";
import {ChevronLeftIcon, ChevronRightIcon} from "@josemi-icons/react";
import {Sidebar} from "../components/sidebar.jsx";

export const SidebarLayout = props => {
    const [collapsed, toggleCollapsed] = useToggle(false);
    return (
        <div className="fixed top-0 left-0 h-full w-full bg-white text-base text-gray-800 flex">
            {!collapsed && (
                <Sidebar />
            )}
            <div className="relative h-full">
                <div
                    className="absolute left-0 top-half z-50 cursor-pointer"
                    style={{
                        transform: "translateY(-50%)",
                    }}
                    onClick={toggleCollapsed}
                >
                    <div className="flex bg-gray-200 text-lg py-2 pr-1 rounded-tr-md rounded-br-md">
                        {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </div>
                </div>
            </div>
            {props.children}
        </div>
    );
};
