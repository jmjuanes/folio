import React from "react";
import {useMount} from "react-use";
import {createScene} from "../scene.js";
import {promisifyValue} from "../utils/promises.js";
import {Loading} from "../components/loading.jsx";

// @private Shared scene context
export const SceneContext = React.createContext(null);

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
        promisifyValue(initialData).then(value => {
            return setScene(createScene(value || {}));
        });
    });
    // If scene is not available (yet), do not render
    if (!scene) {
        return <Loading />;
    }
    // Render scene context provider
    return (
        <SceneContext.Provider value={scene}>
            {children}
        </SceneContext.Provider>
    );
};
