import React from "react";
import {useClient} from "../contexts/client.jsx";

// @description hook to generate an store to fetch/update data of the provided board
export const useStore = id => {
    const client = useClient();
    return React.useMemo(() => {
        return {
            exists: () => {
                return client.getBoard(id);
            },
            initialize: () => {
                return Promise.resolve(true);
            },
            // manage board data
            data: {
                get: () => {
                    return client.getBoardData(id);
                },
                set: data => {
                    return client.updateBoardData(id, data);
                },
            },
        };
    }, [id, client]);
};
