import React from "react";

export const useDelay = (ms, callback) => {
    React.useEffect(() => {
        setTimeout(() => callback(), ms);
    }, []);
};
