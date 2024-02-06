import React from "react";
import {useMount} from "react-use";
import {createScene} from "@lib/scene.js";

// @private Shared scene context
const SceneContext = React.createContext(null);

// @private import scene data
const importSceneData = initialValue => {
    if (typeof initialValue === "function") {
        // Wrapp the call of this function inside a promise chain
        return Promise.resolve(null).then(() => {
            return initialValue();
        });
    }
    // Check if initial value is just an object
    else if (typeof initialValue === "object" && !!initialValue) {
        return Promise.resolve(initialValue);
    }
    // Other value is not supported
    // Initialize scene empty
    return Promise.resolve({});
};

// @description use scene hook
export const useScene = () => {
    return React.useContext(SceneContext);
};

// @description Scene provider component
// @param {object|function|null} initialData Initial data for scene
// @param {React Children} children React children to render
export const SceneProvider = ({initialData, children}) => {
    const [scene, setScene] = React.useState(null);
    // const [error, setError] = React.useState(null);

    // On mount, import data to create the scene
    // TODO: we would need to handle errors when importing scene data
    useMount(() => {
        importSceneData(initialData).then(value => {
            return setScene(createScene(value));
        });
    });

    // If scene is not available (yet), do not render
    if (!scene) {
        return null;
    }

    return (
        <SceneContext.Provider value={scene}>
            {children}
        </SceneContext.Provider>
    );
};
