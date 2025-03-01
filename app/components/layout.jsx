import React from "react";
import {Alert} from "./ui/alert.jsx";
import {useEditorComponents} from "../contexts/editor-components.jsx";
import {useEditor} from "../contexts/editor.jsx";

// @description: default editor layout
// @param {object} props React props
// @param {React.ReactNode} props.children React children
export const Layout = props => {
    const hideUi = false;
    const editor = useEditor();
    const {
        Menu,
        Toolbar,
        EditionPanel,
        HistoryPanel,
        MinimapPanel,
        ZoomPanel,
    } = useEditorComponents();

    const selectedElements = editor.getSelection();

    return (
        <React.Fragment>
            {props.children}
            {!hideUi && (
                <React.Fragment>
                    {!!Menu && (
                        <div className="absolute top-0 left-0 pt-4 pl-4 z-20 flex gap-2">
                            <Menu />
                        </div>
                    )}
                    {(!!HistoryPanel || !!ZoomPanel) && (
                        <div className="absolute top-0 right-0 pt-4 pr-4 z-40 flex gap-2">
                            {!!HistoryPanel && <HistoryPanel />}
                            {!!ZoomPanel && <ZoomPanel />}
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
                    {!!MinimapPanel && true && (
                        <div className="absolute z-20 bottom-0 mb-4 left-0 ml-4">
                            <MinimapPanel />
                        </div>
                    )}
                    {!editor.page.readonly && selectedElements.length > 0 && (
                        <React.Fragment>
                            {(selectedElements.length > 1 || !selectedElements[0].editing) && (
                                <div className="absolute z-30 top-0 mt-16 right-0 pt-1 pr-4">
                                    <EditionPanel
                                        key={selectedElements.map(el => el.id).join("-")}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    )}
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
