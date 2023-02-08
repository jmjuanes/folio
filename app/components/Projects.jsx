import React from "react";
import classNames from "classnames";
import {DrawingIcon, TrashIcon, CheckIcon, CloseIcon} from "@mochicons/react";
import {useClient} from "../contexts/ClientContext.jsx";
import {useToast} from "../contexts/ToastContext.jsx";
import {Modal} from "./Modal.jsx";

const MiniButton = props => {
    const classList = classNames({
        "d:flex p:2 r:lg cursor:pointer text:lg": true,
        "bg:light-300 bg:light-500:hover text:dark-100 text:dark-700:hover": !props.dark,
        "bg:dark-100 bg:dark-400:hover text:white": props.dark,
    });

    return (
        <div className={classList} onClick={props.onClick}>
            {props.icon}
        </div>
    );
};

const ProjectItem = props => {
    const [confirmDelete, setConfirmDelete] = React.useState(false);
    const classList = classNames({
        "d:flex flex:shrink-0 justify:between flex:col": true,
        "w:48 h:56 shadow:md r:lg p:4 bg:white": true,
        "o:50 cursor:not-allowed": props.isCurrent,
    });

    return (
        <div className={classList}>
            <div className="cursor:pointer select:none" onClick={props.onClick}>
                <div className="d:flex items:center justify:center w:full h:24 r:lg bg:light-500">
                    <div className="d:flex text:2xl text:dark-100">
                        <DrawingIcon />
                    </div>
                </div>
                <div className="mt:2 font:bold">
                    {props.title}
                </div>
                <div className="text:2xs text:dark-100 o:50">
                    Updated <strong>{new Date(props.updatedAt).toDateString()}</strong>
                </div>
            </div>
            <div className="d:flex justify:end">
                {!props.isCurrent && !confirmDelete && (
                    <MiniButton
                        dark={false}
                        icon={(<TrashIcon />)}
                        onClick={() => setConfirmDelete(true)}
                    />
                )}
                {!props.isCurrent && confirmDelete && (
                    <div className="d:flex items:center gap:2 w:full">
                        <div className="mr:auto text:xs o:80">
                            <strong>Remove?</strong>
                        </div>
                        <MiniButton
                            dark={true}
                            icon={(<CheckIcon />)}
                            onClick={props.onDelete}
                        />
                        <MiniButton
                            dark={false}
                            icon={(<CloseIcon />)}
                            onClick={() => setConfirmDelete(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

ProjectItem.defaultProps = {
    isCurrent: false,
    onClick: null,
    onDelete: null,
};

export const Projects = props => {
    const client = useClient();
    const {addToast} = useToast();
    const [projects, setProjects] = React.useState([]);

    // Tiny method to reload projects
    const handleReload = () => {
        client.list().then(list => setProjects(list));
    };
    
    // Load projects when component is mounted
    React.useEffect(handleReload, []);

    return (
        <Modal maxWidth="640px" onClose={props.onClose}>
            <div className="text:5xl mb:4">
                <strong>Projects</strong>
            </div>
            {projects.length === 0 && (
                <div className="">No projects</div>
            )}
            {projects.length > 0 && (
                <div className="d:flex gap:4 w:full overflow-x:auto p:4">
                    {projects.map(project => (
                        <ProjectItem
                            key={project.id}
                            id={project.id}
                            title={project.title}
                            updatedAt={project.updatedAt}
                            isCurrent={project.id === props.current}
                            onClick={() => props.onLoad?.(project.id)}
                            onDelete={() => {
                                return client.delete(project.id).then(() => {
                                    addToast(`Project '${project.title}' has been removed.`);
                                    handleReload();
                                });
                            }}
                        />
                    ))}
                </div>
            )}
        </Modal>
    );
};

Projects.defaultProps = {
    current: "",
    onClose: null,
    onLoad: null,
    onCreate: null,
};
