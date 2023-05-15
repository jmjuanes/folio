import React from "react";
import {CloseIcon, CheckIcon} from "@mochicons/react";
import {Modal} from "../components/commons/Modal.jsx";
import {PrimaryButton, SecondaryButton} from "../components/commons/Button.jsx";

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

    return (
        <ConfirmContext.Provider value={{confirm, showConfirm, hideConfirm}}>
            {props.children}
            {confirm?.visible && (
                <Modal maxWidth={props.width}>
                    {!!confirm.title && (
                        <div className="font-bold text-lg mb-4 lh-normal">{confirm.title}</div>
                    )}
                    <div className="mb-8 lh-normal">{confirm.message}</div>
                    <div className="d-flex gap-2 w-full flex-row-reverse">
                        <PrimaryButton
                            text={props.confirmText}
                            onClick={() => {
                                confirm?.callback?.();
                                hideConfirm();
                            }}
                        />
                        <SecondaryButton
                            text={props.cancelText}
                            onClick={() => hideConfirm()}
                        />
                    </div>
                </Modal>
            )}
        </ConfirmContext.Provider>
    );
};

ConfirmProvider.defaultProps = {
    width: "500px",
    confirmText: "Confirm",
    cancelText: "Cancel",
};
