import React from "react";
import {Confirm} from "../components/commons/index.jsx";

const ConfirmContext = React.createContext();
const SHOW_CONFIRM = "SHOW_CONFIRM";
const HIDE_CONFIRM = "HIDE_CONFIRM";

const confirmReducer = (state, action) => {
    if (action.type === SHOW_CONFIRM) {
        return {
            visible: true,
            message: action.payload.message,
            callback: action.payload.callback,
        };
    }
    else if (action.type === HIDE_CONFIRM) {
        return {
            visible: false,
        };
    }
};

export const useConfirm = () => {
    return React.useContext(ConfirmContext);
};

export const ConfirmProvider = props => {
    const [confirm, dispatch] = React.useReducer(confirmReducer, {
        visible: false,
    });

    const showConfirm = message => {
        return new Promise(resolve => {
            return dispatch({
                type: SHOW_CONFIRM,
                payload: {
                    message: message,
                    callback: resolve,
                },
            });
        });
    };

    const hideConfirm = () => {
        return dispatch({
            type: HIDE_CONFIRM,
        })
    };

    return (
        <ConfirmContext.Provider value={{confirm, showConfirm, hideConfirm}}>
            {props.children}
            <Confirm />
        </ConfirmContext.Provider>
    );
};
