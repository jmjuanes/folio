import {
    DATA_TYPES,
    VERSIONS,
} from "./constants.js";

export const isValidFolioData = data => {
    return data && data.type === DATA_TYPES.FOLIO_EXPORT && data.elements;
};

export const parseFromJson = dataStr => {
    return new Promise((resolve, reject) => {
        const data = JSON.parse(dataStr);
        if (!isValidFolioData(data)) {
            return reject(new Error("Invalid Folio data"));
        }
        // TODO: migrate from older versions 
        return resolve({
            elements: data.elements || [],
            state: data.state || {},
        });
    });
};

export const serializeAsJson = opt => {
    return Promise.resolve(JSON.stringify({
        type: DATA_TYPES.FOLIO_EXPORT,
        version: VERSIONS.FOLIO_EXPORT,
        elements: opt?.elements || [],
        state: opt?.state || {},
        // backgroundColor: state.backgroundColor,
        // backgroundImage: state.backgroundImage,
        // width: opt?.state?.width || 0,
        // height: opt?.state?.height || 0,
    }));
};

// Exports the board state
export const exportState = state => ({
    // x: state.x,
    // y: state.y,
    gridEnabled: state.gridEnabled,
    gridColor: state.gridColor,
    gridOpacity: state.gridOpacity,
    gridSize: state.gridSize,
    backgroundColor: state.backgroundColor,
});
