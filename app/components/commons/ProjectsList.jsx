import React from "react";
import {DrawingIcon, PlusIcon, TrashIcon} from "@mochicons/react";
import {useClient} from "../../contexts/ClientContext.jsx";
import {useDelay} from "../../hooks/useDelay.js";

const ProjectEmpty = props => (
    <div className="d:flex flex:shrink-0 items:center justify:center flex:col w:48 h:56 b:dark-100 b:dashed b:2 r:lg p:4">
        <div className="d:flex">
            <div className="d:flex b:2 b:solid b:dark-100 text:dark-100 text:2xl p:2 r:full ">
                <PlusIcon />
            </div>
        </div>
        <div className="mt:3 text:dark-100 text:xs">
            New Project
        </div>
    </div>
);

const ProjectItem = props => (
    <div className="d:flex flex:shrink-0 justify:between flex:col w:48 h:56 b:dark-100 b:solid b:2 r:lg p:4">
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
            <div className="d:flex text:dark-700 text:lg o:70 o:100:hover">
                <TrashIcon />
            </div>
        </div>
    </div>
);

export const ProjectsList = props => {
    const client = useClient();
    const [projects, setProjects] = React.useState([
        {title: "Test project 1", id: "test1"},
        {title: "Test project 2", id: "test2"},
        {title: "Test project 3", id: "test3"},
        {title: "Test project 4", id: "test4"},
    ]);
    
    // Load projects when component is mounted
    useDelay(5, () => {
        // client.list().then(list => setProjects(list));
    });

    return (
        <div className="d:flex gap:4 w:full overflow-x:auto">
            {/* Create a new project item */}
            <ProjectEmpty />
            {/* Other projects */}
            {projects.map(project => (
                <ProjectItem
                    key={project.id}
                    id={project.id}
                    title={project.title}
                />
            ))}
        </div>
    );
};
