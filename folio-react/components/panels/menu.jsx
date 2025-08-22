import React from "react";
import {ACTIONS} from "../../constants.js";
import {Island} from "../ui/island.jsx";
import { useEditorComponents } from "../../contexts/editor-components.tsx";
import {useEditor} from "../../contexts/editor.jsx";
import {useActions} from "../../hooks/use-actions.js";

// @description: default menu panel
export const MenuPanel = () => {
    const editor = useEditor();
    const dispatchAction = useActions();
    const {MainMenu, PagesMenu, SettingsMenu, LibraryMenu} = useEditorComponents();

    // if no menus are available, do not render this panel
    if (!MainMenu && !PagesMenu && !LibraryMenu && !SettingsMenu) {
        return null;
    }

    return (
        <React.Fragment>
            {!!MainMenu && (
                <Island>
                    <MainMenu />
                </Island>
            )}
            <Island>
                {!!PagesMenu && <PagesMenu />}
                {!!LibraryMenu && <LibraryMenu />}
                {!!SettingsMenu && <SettingsMenu />}
                <Island.Button
                    icon="trash"
                    onClick={() => {
                        dispatchAction(ACTIONS.CLEAR_PAGE);
                    }}
                    disabled={editor.page.readonly}
                />
            </Island>
        </React.Fragment>
    );
};
