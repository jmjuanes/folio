import { createContext, useContext, useState, useMemo, useRef } from "react";
import classNames from "classnames";
import { renderIcon } from "@josemi-icons/react";
import type { JSX, PropsWithChildren, CSSProperties } from "react";

// amount of time in milliseconds to wait before automatically removing a toast
const TOAST_DURATION = 4000;

export type Toast = {
    message?: string;
    messageClassName?: string;
    messageStyle?: CSSProperties;
    icon?: string; // optional icon
    iconClassName?: string; // optional icon class name
    iconStyle?: CSSProperties;
    duration?: number; // duration in milliseconds
};

export type ActiveToast = {
    data: Toast | null;
    visible: boolean;
};

// export the type to display a new toast
export type Toaster = {
    success: (message: string) => void;
    error: (message: string) => void;
    dismiss: () => void;
};

// toaster context
export const ToasterContext = createContext<Toaster>({} as Toaster);

// hook to display a toast message
export const useToaster = (): Toaster => {
    return useContext(ToasterContext);
};

// Toast component
export const ToastComponent = ({ toast }: { toast: Toast }): JSX.Element => {
    const toastClass = classNames({
        "flex items-start gap-2 px-4 py-4 rounded-lg shadow-sm": true,
        "bg-gray-950 text-white": true,
    });
    return (
        <div className={toastClass}>
            {toast?.icon && (
                <div className={classNames("flex leading-none", toast.iconClassName)}>
                    {renderIcon(toast.icon)}
                </div>
            )}
            <div className="flex flex-col gap-1 mt-px">
                <div className="min-h-4 font-bold tracking-tight leading-none text-sm">
                    {toast?.message || ""}
                </div>
            </div>
        </div>
    );
};

export const ToasterProvider = (props: PropsWithChildren): JSX.Element => {
    const [ toast, setToast ] = useState<ActiveToast>({ data: null, visible: false });
    const toastTimmer = useRef<any>(null);

    // Function to add a toast and automatically execute the removal after its duration
    const toaster = useMemo<Toaster>(() => {
        const createToast = (toast: Toast) => {
            clearTimeout(toastTimmer.current); // clear previous timer if exists
            setToast({ data: toast, visible: true });

            // automatically remove the toast after its duration
            toastTimmer.current = setTimeout(() => {
                setToast({ visible: false, data: toast });
            }, toast?.duration || TOAST_DURATION);
        };
        return {
            success: (message: string) => {
                createToast({ message, icon: "check-circle" });
            },
            error: (message: string) => {
                createToast({ message, icon: "x-circle" });
            },
            dismiss: () => {
                clearTimeout(toastTimmer.current);
                setToast(prevToast => {
                    return Object.assign({}, prevToast, { visible: false });
                });
            },
        } as Toaster;
    }, [ setToast ]);

    // toaster style
    const toasterStyle: CSSProperties = {
        position: "relative",
        transition: "bottom 0.3s linear",
        bottom: toast.visible ? "1rem" : "-6rem" ,
    };

    return (
        <ToasterContext.Provider value={toaster}>
            {props.children}
            <div className="fixed bottom-0 z-50" style={{ left: "50%", transform: "translateX(-50%)" }}>
                <div className="relative" style={toasterStyle}>
                    {toast?.data && (
                        <ToastComponent toast={toast.data} />
                    )}
                </div>
            </div>
        </ToasterContext.Provider>
    );
};
