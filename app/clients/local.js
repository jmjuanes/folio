import {get, set, del, update, createStore} from "idb-keyval";
// import {generateRandomId} from "folio-board/utils/stringUtils.js";

import {DB_NAME, DB_STORE} from "../constants.js";

const KEYS = {
    PROJECTS: "projects",
    CURRENT_PROJECT: "current_project",
};

export const createLocalClient = () => {
    const store = createStore(DB_NAME, DB_STORE);
    const getProjectKey = id => `project:${id}`;
    const isProjectKey = key => key.startsWith("project:");

    return {
        async initialize() {
            let currentProject = await this.getCurrentProject();
            // If current project is not defined, we will create a new empty project and set it
            // as the current project
            if (!currentProject) {
                currentProject = await this.createProject();
                await this.setCurrentProject(currentProject);
            }
            return currentProject;
        },
        getCurrentProject() {
            return get(KEYS.CURRENT_PROJECT, store);
        },
        setCurrentProject(id) {
            return set(KEYS.CURRENT_PROJECT, id, store);
        },
        getProjects() {
            return get(KEYS.PROJECTS, store);
        },
        async createProject() {
            // We do not need to register all project metadata, as the board will initialize the
            // non existing fields (like elements, assets and other settings)
            const newProject = {
                id: Math.random().toString(36).slice(2, 7),
                title: "Untitled",
                createdAt: Date.now(),
            };
            await set(getProjectKey(newProject.id), newProject, store);
            await this.registerProject(newProject);

            return newProject.id;
        },
        async getProject(id) {
            return get(getProjectKey(id), store);
        },
        async registerProject(newProject) {
            return update(KEYS.PROJECTS, projects => ([...(projects || []), newProject]), store);
        },
        async updateProject(id, newData) {
            const projectsListUpdater = prevProjects => {
                return prevProjects.map(project => ({
                    ...project,
                    title: id === project.id ? (newData.title ?? project.title) : project.title,
                }));
            };
            const projectUpdater = project => ({
                ...project,
                ...newData,
                updatedAt: Date.now(),
            });

            return Promise.all([
                update(KEYS.PROJECTS, projectsListUpdater, store),
                update(getProjectKey(id), projectUpdater, store),
            ]);
        },
        async deleteProject(id) {
            const projects = await this.getProjects();
            const projectExist = projects.some(p => p.id === id);
            if (!projectExist) {
                return Promise.reject(new Error(`Project '${id}' not found`));
            }
            else if (projects.length === 1) {
                return Promise.reject(new Error(`Can not delete project '${id}' as it is the last project in your workspace`));
            }

            // To remove the project, we need to remove the project key and remove it from the list of projects
            // that are stored in KEYS.PROJECTS field
            return Promise.all([
                del(getProjectKey(id), store),
                set(KEYS.PROJECTS, projects.filter(p => p.id !== id), store),
            ]);
        }
    };
};

