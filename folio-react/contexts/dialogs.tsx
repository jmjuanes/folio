import React from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { Centered } from "../components/ui/centered.jsx";
import { Dialog } from "../components/ui/dialog.tsx";
import { Overlay } from "../components/ui/overlay.jsx";

export type DialogsParams = {
    component: any;
    key?: string;
    props?: any;
    dialogClassName?: string;
};

export type DialogsManager = {
    showDialog: (params: DialogsParams) => void;
    hideDialog: () => void;
};

export type DialogsProviderProps = {
    children: React.ReactNode;
};

// @description dialog context
export const DialogsContext = React.createContext<DialogsManager | null>(null);

// @description hook to access to dialog
// @returns {object} dialog object
// @returns {function} dialog.showDialog function to show a dialog
// @returns {function} dialog.hideDialog function to hide the dialog
export const useDialog = (): DialogsManager | null => {
    return React.useContext(DialogsContext);
};

// @description dialog provider component
// @param {object} props React props
// @param {React Children} props.children React children to render
export const DialogsProvider = (props: DialogsProviderProps): React.JSX.Element => {
    const [activeDialog, setActiveDialog] = React.useState<DialogsParams | null>(null);

    // callback to show a dialog
    // @param {string} name dialog name (must be registered in allDialogs)
    // @param {object} props dialog additional properties
    const showDialog = React.useCallback((options: DialogsParams) => {
        if (!!options?.component) {
            setActiveDialog({
                ...options,
                key: options.key || "dialog." + Date.now(),
            });
        }
    }, [setActiveDialog]);

    // callback to hide the dialog
    const hideDialog = React.useCallback(() => {
        setActiveDialog(null);
    }, [setActiveDialog]);

    // register an effect to listen for the escape key
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !!activeDialog?.component) {
                hideDialog();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [activeDialog, hideDialog]);

    // active dialog component
    const DialogComponent = activeDialog?.component || null;

    // Render dialog context provider
    return (
        <DialogsContext.Provider value={{ showDialog, hideDialog }}>
            {props.children}
            {!!DialogComponent && createPortal([
                <Overlay key="dialog:overlay" className="z-50" />,
                <Centered key="dialog:content" className="fixed z-50 h-full">
                    <Dialog.Content className={classNames("relative", activeDialog?.dialogClassName)}>
                        <Dialog.Close onClick={hideDialog} />
                        <DialogComponent
                            key={activeDialog?.key || "dialog"}
                            {...activeDialog?.props}
                            onClose={hideDialog}
                        />
                    </Dialog.Content>
                </Centered>,
            ], document.body)}
        </DialogsContext.Provider>
    );
};
