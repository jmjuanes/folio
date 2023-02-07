import React from "react";
import Rouct from "rouct";
import {ProjectsList} from "./commons/ProjectsList.jsx";
import {Modal} from "./commons/Modal.jsx";

export const Projects = props => {
    const handleClose = () => {
        Rouct.redirect(`/?id=${props.currentProject}`);
    };

    return (
        <Modal maxWidth="640px" onClose={handleClose}>
            <div className="text:5xl mb:4">
                <strong>Projects</strong>
            </div>
            <ProjectsList
                currentProject={props.currentProject}
                onLoad={id => {
                    Rouct.redirect(`/?id=${id}`);
                }}
            />
        </Modal>
    );
};

Projects.defaultProps = {
    currentProject: "",
};
