import React from "react";

const ADD_TOAST = "add_toast";
const REMOVE_TOAST = "remove_toast";

const toastReducer = (toasts, action) => {
    if (action.type === ADD_TOAST) {
        return [...toasts, action.payload];
    }
    else if (action.type === REMOVE_TOAST) {
        return toasts.filter(toast => toast.id !== action.payload.id);
    }
};

export const ToastContext = React.createContext({});
export const useToast = () => {
    return React.useContext(ToastContext);
};

export const ToastProvider = props => {
    const [toasts, dispatch] = React.useReducer(toastReducer, []);
    const toastCount = React.useRef(0);

    // Remove a toast
    const removeToast = toastId => {
        return dispatch({
            type: REMOVE_TOAST,
            payload: {
                id: toastId,
            },
        });
    };

    // Add a new toast element
    const addToast = message => {
        return dispatch({
            type: ADD_TOAST,
            payload: {
                id: toastCount.current++,
                message: message,
            },
        });
    };

    return (
        <ToastContext.Provider value={{toasts, addToast, removeToast}}>
            {props.children}
        </ToastContext.Provider>
    );
};

ToastProvider.defaultProps = {
    duration: 5000,
};
