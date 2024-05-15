import React from "react";
import {Button, Overlay, Centered, Dialog} from "@folio/ui";

const ConfirmContext = React.createContext();
const SHOW_CONFIRM = "SHOW_CONFIRM";
const HIDE_CONFIRM = "HIDE_CONFIRM";

const confirmReducer = (state, action) => {
    if (action.type === SHOW_CONFIRM) {
        return {
            visible: true,
            title: action.payload.title,
            message: action.payload.message,
            callback: action.payload.callback,
        };
    }
    else if (action.type === HIDE_CONFIRM) {
        return {
            visible: false,
        };
    }
};

export const useConfirm = () => {
    return React.useContext(ConfirmContext);
};

export const ConfirmProvider = props => {
    const [confirm, dispatch] = React.useReducer(confirmReducer, {
        visible: false,
    });
    const showConfirm = payload => {
        return dispatch({
            type: SHOW_CONFIRM,
            payload: payload,
        });
    };
    const hideConfirm = () => {
        return dispatch({
            type: HIDE_CONFIRM,
        })
    };
    const submitConfirm = () => {
        confirm?.callback?.();
        hideConfirm();
    };
    return (
        <ConfirmContext.Provider value={{confirm, showConfirm, hideConfirm}}>
            {props.children}
            {confirm?.visible && (
                <React.Fragment>
                    <Overlay />
                    <Centered className="fixed z-10 h-full">
                        <Dialog className="max-w-md">
                            <Dialog.Header>
                                <Dialog.Title>{confirm.title}</Dialog.Title>
                                <Dialog.Close onClick={hideConfirm} />
                            </Dialog.Header>
                            <Dialog.Body>
                                <Dialog.Description>
                                    {confirm.message}
                                </Dialog.Description>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button variant="secondary" onClick={hideConfirm}>
                                    {props.cancelText}
                                </Button>
                                <Button variant="primary" onClick={submitConfirm}>
                                    {props.confirmText}
                                </Button>
                            </Dialog.Footer>
                        </Dialog>
                    </Centered>
                </React.Fragment>
            )}
        </ConfirmContext.Provider>
    );
};

ConfirmProvider.defaultProps = {
    confirmText: "Confirm",
    cancelText: "Cancel",
};
