import React from "react";
import {Toaster} from "../components/commons/Toaster.jsx";

// Just a tiny utility for launching a setTimeout
const delay = (duration, fn) => window.setTimeout(fn, duration);

export const ToastContext = React.createContext({});
export const useToasts = () => {
    return React.useContext(ToastContext);
};

export const ToastProvider = props => {
    const [toast, setToasts] = React.useState([]);
    const toastCount = React.useRef(0);

    // Remove a toast
    const remove = id => {
        setToasts(prevToasts => {
            return prevToasts.filter(item => item.id !== id);
        })
    };

    // Add a new toast element
    const add = message => {
        const newToast = {
            id: toastCount.count,
            message: message,
        };
        toastCount.current = toastCount.current + 1;
        delay(props.duration, () => remove(newToast.id));
        setToasts(prevToasts => {
            return [...prevToasts, newToast];
        });
    };

    return (
        <ToastContext.Provider value={{add, remove}}>
            {props.children}
            <Toaster
                toasts={toast}
                onRemove={id => remove(id)}
            />
        </ToastContext.Provider>
    );
};

ToastProvider.defaultProps = {
    duration: 5000,
};
