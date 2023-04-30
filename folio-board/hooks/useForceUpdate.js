import React from "react";

export const useForceUpdate = () => {
    return React.useReducer(x => x + 1, 0)[1];
};
