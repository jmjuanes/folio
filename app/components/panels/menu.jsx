import React from "react";
import {Island} from "../ui/island.jsx";
import {useEditorComponents} from "../../contexts/editor-components.jsx";

// @description: default menu panel
export const Menu = () => {
    const {EditorMenu, PagesMenu, SettingsMenu} = useEditorComponents();

    return (
        <Island>
            {!!EditorMenu && <EditorMenu />}
            {!!PagesMenu && <PagesMenu />}
            {!!SettingsMenu && <SettingsMenu />}
        </Island>
    );
};
