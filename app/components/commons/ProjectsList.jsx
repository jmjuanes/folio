import React from "react";
import classNames from "classnames";
import Rouct from "rouct";
import {DrawingIcon, PlusIcon, TrashIcon} from "@mochicons/react";
import {useClient} from "../../contexts/ClientContext.jsx";

const ProjectEmpty = props => {
    const classList = classNames({
        "d:flex flex:shrink-0 items:center justify:center flex:col": true,
        "w:48 h:56 b:light-500 b:dashed b:2 r:lg p:4": true,
    });

    return (
        <div className={classList} onClick={props.onClick}>
            <div className="d:flex">
                <div className="d:flex bg:light-300 text:dark-100 text:2xl p:2 r:full">
                    <PlusIcon />
                </div>
            </div>
            <div className="mt:3 text:dark-100 text:xs">
                New Project
            </div>
        </div>
    );
}

const ProjectItem = props => {
    const classList = classNames({
        "d:flex flex:shrink-0 justify:between flex:col": true,
        "w:48 h:56 shadow:md r:lg p:4": true,
        "o:50 cursor:not-allowed": props.isCurrent,
    });

    return (
        <div className={classList} onClick={props.onClick}>
            <div className="">
                <div className="d:flex items:center justify:center w:full h:24 r:lg bg:light-300">
                    <div className="d:flex text:2xl text:dark-100">
                        <DrawingIcon />
                    </div>
                </div>
                <div className="mt:2 font:bold">
                    {props.title}
                </div>
            </div>
            <div className="d:flex justify:end">
                {!props.isCurrent && (
                    <div className="d:flex p:2 r:lg bg:light-300 bg:light-500:hover" onClick={props.onDelete}>
                        <div className="d:flex text:dark-100 text:dark-700:hover text:lg">
                            <TrashIcon />
                        </div>
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

export const ProjectsList = props => {
    const client = useClient();
    const [projects, setProjects] = React.useState([]);

    // Tiny method to reload projects
    const handleReload = () => {
        client.list().then(list => setProjects(list));
    };
    
    // Load projects when component is mounted
    React.useEffect(handleReload, []);

    return (
        <div className="d:flex gap:4 w:full overflow-x:auto py:4 pr:4">
            {/* Create a new project item */}
            <ProjectEmpty
                onClick={() => {
                    return client.create({}).then(id => {
                        return Rouct.redirect(`/?id=${id}`);
                    });
                }}
            />
            {/* Other projects */}
            {projects.map(project => (
                <ProjectItem
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    isCurrent={project.id === props.current}
                    onClick={() => {
                        return Rouct.redirect(`/?id=${project.id}`);
                    }}
                    onDelete={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        client.delete(project.id).then(() => {
                            // TODO: display a toast notification
                            handleReload();
                        });
                    }}
                />
            ))}
        </div>
    );
};

ProjectsList.defaultProps = {
    current: "",
};
