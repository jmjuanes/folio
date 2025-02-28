import React from "react";
import {ZOOM_MIN, ZOOM_MAX, ZOOM_STEP} from "../../constants.js";
import {Island} from "../ui/island.jsx";
import {Dropdown} from "../ui/dropdown.jsx";
import {useEditor} from "../../contexts/editor.jsx";

const ZoomDropdownItem = props => (
    <Dropdown.Item disabled={props.disabled} onClick={props.onClick}>
        <Dropdown.Icon icon={props.icon} />
        <span>{props.text}</span>
    </Dropdown.Item>
);

export const ZoomPanel = () => {
    const editor = useEditor();
    const zoom = editor.getZoom();
    const selection = editor.getSelection();
    return (
        <Island>
            <Island.Button
                icon="zoom-out"
                disabled={zoom <= ZOOM_MIN}
                onClick={() => {
                    editor.setZoom(zoom - ZOOM_STEP);
                    editor.update();
                }}
            />
            <div className="flex items-center justify-center w-16 h-full select-none relative group" tabIndex="0">
                <Island.Button
                    className="text-xs"
                    text={(
                        <span className="text-xs text-center">
                            {((zoom ?? 1) * 100).toFixed(0) + "%"}
                        </span>
                    )}
                    showChevron={true}
                />
                <Dropdown className="hidden group-focus-within:block top-full right-0 mt-2 w-48 z-50">
                    <ZoomDropdownItem
                        icon="search-check"
                        text="Zoom to 100%"
                        disabled={zoom === 1}
                        onClick={() => {
                            editor.resetZoom();
                            editor.update();
                        }}
                    />
                    <ZoomDropdownItem
                        icon="arrows-maximize"
                        text="Zoom to fit"
                        disabled={editor.page.elements.length === 0}
                        onClick={() => {
                            editor.fitZoomToSelection();
                            editor.update();
                        }}
                    />
                    <ZoomDropdownItem
                        icon="box-selection"
                        text="Zoom to selection"
                        disabled={selection.length === 0}
                        onClick={() => {
                            editor.fitZoomToSelection(selection);
                            editor.update();
                        }}
                    />
                </Dropdown>
            </div>
            <Island.Button
                icon="zoom-in"
                disabled={ZOOM_MAX <= zoom}
                onClick={() => {
                    editor.setZoom(zoom + ZOOM_STEP);
                    editor.update();
                }}
            />
        </Island>
    );
};
