import React from "react";
import {Sidebar, SidebarContent} from "./Sidebar.jsx";

export const MenuSidebar = props => (
    <Sidebar className="w:80 bg:white">
        <SidebarContent>
            Content
        </SidebarContent>
    </Sidebar>
);

MenuSidebar.defaultProps = {
    boards: [],
};
