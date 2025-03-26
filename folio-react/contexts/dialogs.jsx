import React from "react";
import classNames from "classnames";
import {Centered} from "../components/ui/centered.jsx";
import {Dialog} from "../components/ui/dialog.jsx";
import {Overlay} from "../components/ui/overlay.jsx";

// @description dialog context
export const DialogsContext = React.createContext(null);

// @description hook to access to dialog
// @returns {object} dialog object
// @returns {function} dialog.showDialog function to show a dialog
// @returns {function} dialog.hideDialog function to hide the dialog
export const useDialog = () => {
    return React.useContext(DialogsContext);
};

// @description dialog provider component
// @param {object} props React props
// @param {React Children} props.children React children to render
export const DialogsProvider = ({children}) => {
    const [activeDialog, setActiveDialog] = React.useState(null);

    // callback to show a dialog
    // @param {string} name dialog name (must be registered in allDialogs)
    // @param {object} props dialog additional properties
    const showDialog = React.useCallback(options => {
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
        const handleKeyDown = event => {
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
        <DialogsContext.Provider value={{showDialog, hideDialog}}>
            {children}
            {DialogComponent && (
                <React.Fragment>
                    <Overlay className="z-50" />
                    <Centered className="fixed z-50 h-full">
                        <Dialog className={classNames("relative", activeDialog.dialogClassName)}>
                            <Dialog.Close onClick={hideDialog} />
                            <DialogComponent
                                key={activeDialog.key || "dialog"}
                                {...activeDialog.props}
                                onClose={hideDialog}
                            />
                        </Dialog>
                    </Centered>
                </React.Fragment>
            )}
        </DialogsContext.Provider>
    );
};
