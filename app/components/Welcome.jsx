import React from "react";
import {ShieldCheckIcon, TabletIcon} from "@mochicons/react";
import {Modal} from "./commons/Modal.jsx";
import {ProjectsList} from "./commons/ProjectsList.jsx";

const WelcomeItem = props => (
    <div className="d:flex flex:col w:full r:lg bg:light-300 p:6 justify:center items:center">
        <div className="d:flex text:dark-300 text:xl">
            {props.icon}
        </div>
        <div className="text:center text:dark-300 text:sm mt:1">
            <strong>{props.title}</strong>
        </div>
        <div className="text:center text:dark-100 text:xs mt:1">
            {props.text}
        </div>
    </div>
);

export const Welcome = () => {
    const items = {
        drawing: {
            icon: (<TabletIcon />),
            title: "Draw Anywhere",
            text: "Use Folio in your computer or in your tablet. You only need a browser.",
        },
        privacy: {
            icon: (<ShieldCheckIcon />),
            title: "Privacy First",
            text: "Your projects are stored in your browser. No servers. No transfer.",
        },
    };

    return (
        <Modal maxWidth="640px">
            <div className="pt:6">
                <div className="font:bold text:7xl">Folio.</div>
                <div className="text:dark-100">
                    A minimalistic digital whiteboard for 
                    sketching and prototyping.
                </div>
            </div>
            <div className="d:flex gap:4 mt:6 w:full">
                {Object.keys(items).map(key => (
                    <WelcomeItem key={key} {...items[key]} />
                ))}
            </div>
            <div className="mt:8">
                <div className="text:dark-100 text:sm">Your projects:</div>
                <ProjectsList />
            </div>
        </Modal>
    );
};
