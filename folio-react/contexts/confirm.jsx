import React from "react";
import {Button} from "../components/ui/button.jsx";
import {Overlay} from "../components/ui/overlay.jsx";
import {Centered} from "../components/ui/centered.jsx";
import {Dialog} from "../components/ui/dialog.jsx";

const ConfirmContext = React.createContext();
const SHOW_CONFIRM = "SHOW_CONFIRM";
const HIDE_CONFIRM = "HIDE_CONFIRM";

const confirmReducer = (state, action) => {
    if (action.type === SHOW_CONFIRM) {
        return {
            visible: true,
            title: action.payload.title,
            message: action.payload.message,
            confirmText: action.payload.confirmText,
            cancelText: action.payload.cancelText,
            callback: action.payload.callback,
        };
    }
    else if (action.type === HIDE_CONFIRM) {
        return {
            visible: false,
        };
    }
};

// @description confirm hook to access to confirm dialog
export const useConfirm = () => {
    return React.useContext(ConfirmContext);
};

// @description confirm provider component
// @param {object} props React props
// @param {React.ReactNode} props.children React children to render
// @param {string} props.confirmText default confirm button text
// @param {string} props.cancelText default cancel button text
export const ConfirmProvider = props => {
    const [confirm, dispatch] = React.useReducer(confirmReducer, {
        visible: false,
    });

    // show a confirm dialog
    // @param {object} payload confirm dialog properties
    const showConfirm = React.useCallback(payload => {
        return dispatch({
            type: SHOW_CONFIRM,
            payload: payload,
        });
    }, [dispatch]);

    // hide the confirm dialog
    const hideConfirm = React.useCallback(() => {
        return dispatch({
            type: HIDE_CONFIRM,
        });
    }, [dispatch]);

    // submit the confirm dialog
    const submitConfirm = React.useCallback(() => {
        confirm?.callback?.();
        hideConfirm();
    }, [confirm, hideConfirm]);

    // register an effect to listen for the escape key and hide the dialog
    React.useEffect(() => {
        const handleKeyDown = event => {
            if (event.key === "Escape" && confirm?.visible) {
                hideConfirm();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [confirm, hideConfirm]);

    return (
        <ConfirmContext.Provider value={{confirm, showConfirm, hideConfirm}}>
            {props.children}
            {confirm?.visible && (
                <React.Fragment>
                    <Overlay className="z-50" />
                    <Centered className="fixed z-50 h-full">
                        <Dialog className="max-w-lg relative">
                            <Dialog.Close onClick={hideConfirm} />
                            <Dialog.Header>
                                <Dialog.Title>{confirm.title}</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Dialog.Description>
                                    {confirm.message}
                                </Dialog.Description>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button variant="secondary" onClick={hideConfirm}>
                                    {confirm?.cancelText || props.cancelText || "Cancel"}
                                </Button>
                                <Button variant="primary" onClick={submitConfirm}>
                                    {confirm?.confirmText || props.confirmText || "Confirm"}
                                </Button>
                            </Dialog.Footer>
                        </Dialog>
                    </Centered>
                </React.Fragment>
            )}
        </ConfirmContext.Provider>
    );
};
