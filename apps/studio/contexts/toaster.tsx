import React from "react";
import classNames from "classnames";
import { renderIcon } from "@josemi-icons/react";
import { uid } from "uid/secure";

export enum ToastType {
    SUCCESS = "success",
    ERROR = "error",
    WARNING = "warning",
    DEFAULT = "default",
};

export type Toast = {
    title: string;
    type: ToastType;
    id?: string;
    icon?: string; // optional icon
    message?: string;
    duration?: number; // duration in milliseconds
};

export type ToastOptions = {
    message?: string;
    icon?: string;
};

export type Toaster = {
    default: (title: string, options: ToastOptions) => void;
    success: (title: string, options?: ToastOptions) => void;
    error: (title: string, options?: ToastOptions) => void;
    warning: (title: string, options?: ToastOptions) => void;
};

// available toast icons
const toastIcons = {
    [ToastType.SUCCESS]: "check-circle",
    [ToastType.ERROR]: "x-circle",
    [ToastType.WARNING]: "exclamation-triangle",
    [ToastType.DEFAULT]: "info-circle",
};

// toaster context
export const ToasterContext = React.createContext<Toaster>(null);

// hook to display a toast message
export const useToaster = (): Toaster => {
    return React.useContext(ToasterContext);
};

// Toast component
export const ToastComponent = ({ toast }: { toast: Toast }): React.JSX.Element => {
    const icon = toastIcons[toast.type] || toastIcons[ToastType.DEFAULT];
    const toastClass = classNames({
        "flex items-start gap-2 px-4 py-4 mb-2 rounded-lg shadow-sm border-1": true,
        "bg-green-50 text-green-900 border-green-100": toast.type === ToastType.SUCCESS,
        "bg-red-50 text-red-900 border-red-100": toast.type === ToastType.ERROR,
        "bg-yellow-50 text-yellow-900 border-yellow-100": toast.type === ToastType.WARNING,
        "bg-white text-gray-900 border-gray-200": toast.type === ToastType.DEFAULT,
    });

    return (
        <div className={toastClass}>
            <div className="flex leading-none">
                {renderIcon(icon)}
            </div>
            <div className="flex flex-col gap-1 mt-px">
                <div className="min-h-4 font-medium tracking-tight leading-none text-sm">
                    {toast.title || "Notification"}
                </div>
                {toast.message && (
                    <div className="text-xs opacity-60">
                        {toast.message}
                    </div>
                )}
            </div>
        </div>
    );
}

// ToasterProvider component
export const ToasterProvider = ({ defaultDuration = 5000, children }): React.JSX.Element => {
    const [ toasts, setToasts ] = React.useState<Toast[]>([]);

    const addToast = React.useCallback((toast: Toast) => {
        const id = toast.id || uid();
        setToasts((prevToasts) => {
            return [...prevToasts, {...toast, id: id}];
        });
        // Automatically remove the toast after its duration
        setTimeout(() => {
            setToasts((prevToasts) => prevToasts.filter(t => t.id !== id));
        }, toast.duration || defaultDuration);
    }, [setToasts, defaultDuration]);

    const toaster = React.useMemo<Toaster>(() => {
        return {
            [ToastType.DEFAULT]: (title: string, options: Partial<Toast> = {}) => {
                return addToast({
                    title: title,
                    type: ToastType.DEFAULT,
                    icon: options?.icon || "info-circle",
                    message: options?.message,
                });
            },
            [ToastType.SUCCESS]: (title: string, options: Partial<Toast> = {}) => {
                return addToast({
                    title: title,
                    type: ToastType.SUCCESS,
                    icon: options?.icon || "check-circle",
                    message: options?.message,
                });
            },
            [ToastType.ERROR]: (title: string, options: Partial<Toast> = {}) => {
                return addToast({
                    title: title,
                    type: ToastType.ERROR,
                    icon: options?.icon || "x-circle",
                    message: options?.message,
                });
            },
            [ToastType.WARNING]: (title: string, options: Partial<Toast> = {}) => {
                return addToast({
                    title: title,
                    type: ToastType.WARNING,
                    icon: options?.icon || "exclamation-triangle",
                    message: options?.message,
                });
            },
        } as Toaster;
    }, [addToast]);

    return (
        <ToasterContext.Provider value={toaster}>
            {children}
            {toasts.length > 0 && (
                <div className="fixed top-0 left-half z-50 mt-4 w-full max-w-xl" style={{ transform: "translateX(-50%)" }}>
                    {toasts.map((toast) => (
                        <ToastComponent key={toast.id} toast={toast} />
                    ))}
                </div>
            )}
        </ToasterContext.Provider>
    );
};
