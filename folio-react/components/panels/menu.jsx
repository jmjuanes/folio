import React from "react";
import {ACTIONS} from "../../constants.js";
import {Island} from "../ui/island.jsx";
import {useEditorComponents} from "../../contexts/editor-components.jsx";
import {useEditor} from "../../contexts/editor.jsx";
import {useActions} from "../../hooks/use-actions.js";

// @description: default menu panel
export const Menu = () => {
    const editor = useEditor();
    const dispatchAction = useActions();
    const {EditorMenu, PagesMenu, SettingsMenu, LibraryMenu} = useEditorComponents();

    return (
        <React.Fragment>
            {!!EditorMenu && (
                <Island>
                    <EditorMenu />
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
