import React from "react";
import { exportToDataURL } from "folio-react/lib/export.js";
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
import { useConfiguration } from "../../contexts/configuration.tsx";
import { NotFound } from "../not-found.tsx";
import {
    THUMBNAIL_WIDTH,
    THUMBNAIL_HEIGHT,
    THUMBNAIL_PADDING,
    THUMBNAIL_DELAY
} from "../../constants.ts";

// @description editor route component
// it handles loading the board data, checking if it exists, and saving changes
// it also handles generating the thumbnail when the board is updated
export const EditorRoute = (props: any): React.JSX.Element => {
    const isFirstUpdate = React.useRef<boolean>(true);
    const lastUpdatedData = React.useRef<any>(null);
    const thumbnailUpdateTimer = React.useRef<any>(null);
    const [initialData, setInitialData] = React.useState<any>(null);
    const [exists, setExists] = React.useState<boolean>(null);
    const { app } = useAppState();
    const { preferences } = useConfiguration();

    // callback method to generate and save the thumbnail
    const handleThumbnailUpdate = React.useCallback(() => {
        if (lastUpdatedData.current) {
            // TODO: get the last active page
            const page = lastUpdatedData.current.pages?.[0] || null;
            if (!page || !page.elements || page.elements.length === 0) {
                return Promise.resolve(null);
            }
            const exportOptions = {
                assets: lastUpdatedData.current.assets,
                width: THUMBNAIL_WIDTH,
                height: THUMBNAIL_HEIGHT,
                background: page?.background || lastUpdatedData.current?.background || "#fff",
                padding: THUMBNAIL_PADDING,
            };
            return exportToDataURL(page?.elements || [], exportOptions)
                .then(thumbnailStr => {
                    const originalAttributes = JSON.parse(initialData?.attributes || "{}");
                    return app.updateDocument(props.id, {
                        attributes: JSON.stringify({
                            ...originalAttributes,
                            thumbnail: thumbnailStr,
                        }),
                    });
                })
                .catch(error => {
                    console.error("Error updating thumbnail:", error);
                });
        }
    }, [props.id, app, initialData]);

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
        // update the last updated data and schedule a thumbnail update
        lastUpdatedData.current = data;
        if (thumbnailUpdateTimer.current !== null) {
            window.clearTimeout(thumbnailUpdateTimer.current);
        }
        thumbnailUpdateTimer.current = window.setTimeout(() => {
            handleThumbnailUpdate();
        }, THUMBNAIL_DELAY);
    }, [props.id, app, handleThumbnailUpdate]);

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
    }, [props.id, app]);

    // when app is unmounted, clear any pending thumbnail update
    React.useEffect(() => {
        return () => {
            if (thumbnailUpdateTimer.current !== null) {
                window.clearTimeout(thumbnailUpdateTimer.current);
            }
            // also, if there is a pending thumbnail update, do it now
            if (lastUpdatedData.current) {
                handleThumbnailUpdate().then(() => {
                    app.refresh();
                });
            }
        };
    }, []);

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
            preferences={preferences || {}}
            onChange={handleDataChange}
        />
    );
};
