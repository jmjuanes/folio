import React from "react";

export const useNotifications = () => {
    const [notifications, setNotifications] = React.useState([]);
    const addNotification = (type, message) => {
        const newNotification = {
            id: Date.now(),
            type: type,
            message: message,
        };
        setNotifications([...notifications, newNotification].reverse());
    };

    return {
        getAll: () => notifications,
        error: message => addNotification("error", message),
        warning: message => addNotification("warning", message),
        success: message => addNotification("success", message),
        notice: message => addNotification("notice", message),
        remove: id => {
            setNotifications(notifications.filter(item => item.id !== id));
        },
    };
};
