import React from "react";
import { Editor } from "folio-react/components/editor.jsx";
import {
    MainMenu,
    MainMenuOpenAction,
    MainMenuSaveAction,
    MainMenuExportAction,
    MainMenuResetAction,
    MainMenuSeparator,
    MainMenuShowShortcutsAction,
} from "folio-react/components/menus/main.tsx";
import { Loading } from "folio-react/components/loading.jsx";
import { useAppState } from "../../contexts/app-state.tsx";
import { NotFound } from "../not-found.tsx";

export const EditorRoute = (props: any): React.JSX.Element => {
    const isFirstUpdate = React.useRef(true);
    const [ initialData, setInitialData ] = React.useState<any>(null);
    const [ exists, setExists ] = React.useState<boolean>(null);
    const { app } = useAppState();

    // handle saving data or library
    const handleDataChange = React.useCallback(data => {
        app.updateDocument(props.id, { data: JSON.stringify(data) }).then(() => {
            // if this is the first time that we have updated the document
            // we have to perform a refresh of the user documents
            if (isFirstUpdate.current) {
                app.refresh();
                isFirstUpdate.current = false;
            }
        });
    }, [ props.id, app ]);

    // on mount, check if the board exists
    // it includes a little protection against rapid board entering/exit
    React.useEffect(() => {
        let didEnter = true; // if it changes to false, stop loading board
        const timer = window.setTimeout(() => {
            if (!didEnter) {
                return;
            }
            // check if board exists and get the initial data
            app.getDocument(props.id)
                .then(boardData => {
                    if (boardData?.id) {
                        setInitialData(boardData);
                        setExists(true);
                    }
                    else {
                        setInitialData({});
                        setExists(false);
                    }
                })
                .catch(error => {
                    console.error(error);
                    setInitialData({});
                    setExists(false); // Assume board does not exist on error
                });
        }, 1200);
        // on unmount, clear the timer and stop checking if board exists
        return () => {
            window.clearTimeout(timer);
            didEnter = false;
        };
    }, [ props.id, app ]);

    // gneerate custom components for the editor
    const customComponents = React.useMemo(() => ({
        MainMenu: () => (
            <MainMenu>
                <MainMenuOpenAction />
                <MainMenuSaveAction />
                <MainMenuExportAction />
                <MainMenuResetAction />
                <MainMenuSeparator />
                <MainMenuShowShortcutsAction />
            </MainMenu>
        ),
    }), []);

    // we do not know (yet) if the board exists, so we set it to null
    if (exists === null || initialData === null) {
        return (
            <Loading className="h-full" />
        );
    }

    // if the board does not exist, we display a centered message
    if (!exists) {
        return (
            <NotFound />
        );
    }

    return (
        <Editor
            key={props.id}
            data={() => {
                return JSON.parse(initialData?.data || "{}");
            }}
            components={customComponents}
            onChange={handleDataChange}
        />
    );
};
