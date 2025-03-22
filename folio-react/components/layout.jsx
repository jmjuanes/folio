import React from "react";
import classNames from "classnames";
import {PREFERENCES_FIELDS} from "../constants.js";
import {Alert} from "./ui/alert.jsx";
import {Island} from "./ui/island.jsx";
import {useEditorComponents} from "../contexts/editor-components.jsx";
import {useEditor} from "../contexts/editor.jsx";

// @description: default editor layout
// @param {object} props React props
// @param {React.ReactNode} props.children React children
export const Layout = props => {
    const hideUi = false;
    const [layersVisible, setLayersVisible] = React.useState(false);
    const editor = useEditor();
    const {
        Menu,
        Toolbar,
        Layers,
        EditionPanel,
        HistoryPanel,
        MinimapPanel,
        ZoomPanel,
    } = useEditorComponents();

    // we need the selected elements list to display the edition panel
    const selectedElements = editor.getSelection();

    return (
        <React.Fragment>
            {props.children}
            {!hideUi && (
                <React.Fragment>
                    {!!Menu && (
                        <div className="absolute top-0 left-0 pt-4 pl-4 z-40 flex gap-2">
                            <Menu />
                        </div>
                    )}
                    {(!!HistoryPanel || !!ZoomPanel || !!Layers) && (
                        <div className="absolute top-0 right-0 pt-4 pr-4 z-40 flex gap-2">
                            {!!HistoryPanel && <HistoryPanel />}
                            {!!ZoomPanel && <ZoomPanel />}
                            {!!Layers && (
                                <Island>
                                    <Island.Button
                                        icon="stack"
                                        onClick={() => setLayersVisible(!layersVisible)}
                                        active={layersVisible}
                                    />
                                </Island>
                            )}
                        </div>
                    )}
                    {!!editor.page.readonly && (
                        <div className="absolute top-0 left-half pt-4 z-30 flex gap-2 translate-x-half-n pointer-events-none">
                            <Alert variant="warning" icon="lock">
                                This page is <b>Read-Only</b>.
                            </Alert>
                        </div>
                    )}
                    {!!Toolbar && (
                        <div className="absolute z-20 left-half bottom-0 mb-4" style={{transform:"translateX(-50%)"}}>
                            <Toolbar />
                        </div>
                    )}
                    {!!MinimapPanel && !!editor.preferences[PREFERENCES_FIELDS.MINIMAP_VISIBLE] && (
                        <div className="absolute z-20 bottom-0 mb-4 left-0 ml-4">
                            <MinimapPanel />
                        </div>
                    )}
                    {!editor.page.readonly && selectedElements.length > 0 && (
                        <React.Fragment>
                            {(selectedElements.length > 1 || !selectedElements[0].editing) && (
                                <div className="absolute z-20 top-0 mt-16 left-0 pt-1 pl-4">
                                    <EditionPanel
                                        key={selectedElements.map(el => el.id).join("-")}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    )}
                    {!!Layers && layersVisible && (
                        <div className="absolute z-30 top-0 right-0 pt-1 mt-16 mr-4">
                            <Layers />
                        </div>
                    )}
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
