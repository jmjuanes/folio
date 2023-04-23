import React from "react";
import {DrawingIcon, FolderIcon} from "@mochicons/react";
import {Modal} from "../commons/Modal.jsx";
import {SecondaryButton} from "../commons/Button.jsx";

export const Welcome = props => (
    <Modal maxWidth={props.width}>
        <div className="pt-4 select-none">
            <div className="font-bold text-7xl mb-4">{props.title}</div>
            <div className="text-dark-100 lh-relaxed">{props.description}</div>
        </div>
        <div className="mt-8 d-flex flex-col gap-2">
            <SecondaryButton
                icon={(<DrawingIcon />)}
                text="Start Drawing"
                onClick={props.onClose}
            />
            <SecondaryButton
                icon={(<FolderIcon />)}
                text="Load Board"
                onClick={props.onLoad}
            />
        </div>
        {props.version && (
            <div className="mt-4 text-gray-400 text-center text-xs select-none">
                Currently <b>v{props.version}</b>. 
            </div>
        )}
    </Modal>
);

Welcome.defaultProps = {
    width: "25rem",
    title: "Folio.",
    description: "Welcome to Folio, our work-in-progress minimal digital whiteboard for sketching and prototyping.",
    version: "",
    onClose: null,
    onLoad: null,
};