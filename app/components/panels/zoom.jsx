import React from "react";
import {ZOOM_MIN, ZOOM_MAX} from "../../constants.js";
import {Island} from "../island.jsx";
import {Dropdown} from "../ui/dropdown.jsx";
import {useScene} from "../../contexts/scene.jsx";

export const ZoomPanel = props => {
    const scene = useScene();
    const selection = scene.getSelection();
    return (
        <Island>
            <Island.Button
                icon="zoom-out"
                disabled={props.zoom <= ZOOM_MIN}
                onClick={props.onZoomOutClick}
            />
            <div className="flex items-center justify-center w-16 h-full select-none relative group" tabIndex="0">
                <Island.Button
                    className="text-xs"
                    text={<span className="text-xs text-center">{((props.zoom ?? 1) * 100).toFixed(0) + "%"}</span>}
                    showChevron={true}
                />
                <Dropdown className="hidden group-focus-within:block top-full right-0 mt-2 w-48 z-50">
                    <Dropdown.Item disabled={props.zoom === 1} onClick={props.onZoomResetClick}>
                        <Dropdown.Icon icon="search-check" />
                        <span>Zoom to 100%</span>
                    </Dropdown.Item>
                    <Dropdown.Item disabled={scene.page.elements.length === 0} onClick={props.onZoomToFitClick}>
                        <Dropdown.Icon icon="arrows-maximize" />
                        <span>Zoom to fit</span>
                    </Dropdown.Item>
                    <Dropdown.Item disabled={selection.length === 0} onClick={props.onZoomToSelectionClick}>
                        <Dropdown.Icon icon="box-selection" />
                        <span>Zoom to selection</span>
                    </Dropdown.Item>
                </Dropdown>
            </div>
            <Island.Button
                icon="zoom-in"
                disabled={ZOOM_MAX <= props.zoom}
                onClick={props.onZoomInClick}
            />
        </Island>
    );
};
