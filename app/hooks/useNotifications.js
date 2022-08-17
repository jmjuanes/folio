import React from "react";
import {Toasts} from "../components/Toasts.js";

export const useNotifications = () => {
    const [notifications, setNotifications] = React.useState([]);
    const addNotification = (type, message) => {
        const newNotification = {
            id: Date.now(),
            type: type,
            message: message,
        };
        setNotifications(prev => [...prev, newNotification].reverse());
    };
    const renderNotifications = () => (
        <Toasts
            items={notifications}
            onDelete={id => setNotifications(prev => prev.filter(item => item.id !== id))}
        />
    );
    const notificationsApi = {
        error: message => addNotification("error", message),
        warning: message => addNotification("warning", message),
        success: message => addNotification("success", message),
        notice: message => addNotification("notice", message),
    };

    return [notificationsApi, renderNotifications];
};
