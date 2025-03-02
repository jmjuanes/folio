import React from "react";
import {Island} from "../ui/island.jsx";
import {useEditorComponents} from "../../contexts/editor-components.jsx";
import {useEditor} from "../../contexts/editor.jsx";
import {useConfirm} from "../../contexts/confirm.jsx";

// @description: default menu panel
export const Menu = () => {
    const editor = useEditor();
    const {showConfirm} = useConfirm();
    const {EditorMenu, PagesMenu, SettingsMenu, LibraryMenu} = useEditorComponents();

    // callback to handle clearing the current page
    const handlePageClear = React.useCallback(() => {
        return showConfirm({
            title: "Clear Page",
            message: "This will remove all elements of this page. Do you want to continue?",
            confirmText: "Yes, clear page",
            callback: () => {
                editor.clearPage(editor.page.id);
                editor.dispatchChange();
                editor.update();
            },
        });
    }, [editor, showConfirm, editor.page.id]);

    return (
        <Island>
            {!!EditorMenu && <EditorMenu />}
            {!!PagesMenu && <PagesMenu />}
            {!!LibraryMenu && <LibraryMenu />}
            {!!SettingsMenu && <SettingsMenu />}
            <Island.Button
                icon="trash"
                onClick={handlePageClear}
                disabled={editor.page.readonly}
            />
        </Island>
    );
};
