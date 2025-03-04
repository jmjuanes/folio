import React from "react";
import {useEditorComponents} from "./editor-components.jsx";
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
// @param {object} props.dialogs override or extend the default dialogs
// @param {React Children} props.children React children to render
export const DialogsProvider = ({dialogs, children}) => {
    const [activeDialog, setActiveDialog] = React.useState(null);
    const {
        ExportDialog,
        LibraryAddDialog,
        LibraryExportDialog,
        PagesEditDialog,
    } = useEditorComponents();

    // internal list of all available dialogs in the editor
    const allDialogs = React.useMemo(() => {
        return {
            "export": {
                title: "Export Image",
                component: ExportDialog,
            },
            "library-add": {
                title: "Add to Library",
                component: LibraryAddDialog,
            },
            "library-export": {
                title: "Export Library",
                component: LibraryExportDialog,
            },
            "pages-edit": {
                title: "Edit Page",
                component: PagesEditDialog,
            },
            ...dialogs,
        };
    }, [dialogs]);

    // callback to show a dialog
    // @param {string} name dialog name (must be registered in allDialogs)
    // @param {object} props dialog additional properties
    const showDialog = React.useCallback((name = "", props = {}) => {
        if (!!name && typeof allDialogs[name] !== "undefined") {
            setActiveDialog({
                name: name,
                props: props || {},
                key: name + "." + Date.now(),
            });
        }
    }, [allDialogs, setActiveDialog]);

    // callback to hide the dialog
    const hideDialog = React.useCallback(() => {
        setActiveDialog(null);
    }, [setActiveDialog]);

    // active dialog component
    const dialog = activeDialog?.name ? allDialogs[activeDialog.name] : null;
    const DialogComponent = dialog?.component || null;

    // Render dialog context provider
    return (
        <DialogsContext.Provider value={{showDialog, hideDialog}}>
            {children}
            {dialog && DialogComponent && (
                <React.Fragment>
                    <Overlay className="z-50" />
                    <Centered className="fixed z-50 h-full">
                        <Dialog className="max-w-md relative">
                            <Dialog.Close onClick={hideDialog} />
                            <Dialog.Header className="mb-4">
                                <Dialog.Title>{dialog.title}</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <DialogComponent
                                    key={activeDialog.key}
                                    {...activeDialog.props}
                                    onClose={hideDialog}
                                />
                            </Dialog.Body>
                        </Dialog>
                    </Centered>
                </React.Fragment>
            )}
        </DialogsContext.Provider>
    );
};
