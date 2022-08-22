import React from "react";
import {Toasts} from "../components/Toasts.js";

export const useNotification = () => {
    const [notifications, setNotifications] = React.useState([]);
    const addNotification = (message, icon) => {
        const newNotification = {
            id: Date.now(),
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

    return [addNotification, renderNotifications];
};
