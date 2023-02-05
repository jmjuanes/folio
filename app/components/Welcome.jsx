import React from "react";
import Rouct from "rouct";
import {Modal} from "./commons/Modal.jsx";
import {ProjectsList} from "./commons/ProjectsList.jsx";

export const Welcome = props => (
    <Modal maxWidth="580px">
        <div className="">
            <div className="text:sm text:dark-100 o:80">Welcome to</div>
            <div className="font:bold text:7xl">Folio.</div>
            <div className="text:dark-100">A minimalistic digital whiteboard for sketching and prototyping.</div>
        </div>
        <div className="mt:16">
            <ProjectsList />
        </div>
    </Modal>
);
