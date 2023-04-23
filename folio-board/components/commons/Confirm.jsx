import React from "react";
import {CloseIcon, CheckIcon} from "@mochicons/react";
import {useConfirm} from "../../contexts/ConfirmContext.jsx";
import {Modal} from "./Modal.jsx";
import {PrimaryButton, SecondaryButton} from "./Button.jsx";

export const Confirm = () => {
    const {confirm, hideConfirm} = useConfirm();

    if (confirm.visible) {
        return (
            <Modal maxWidth="400px">
                <div className="pb-8 text-center">
                    {confirm.message}
                </div>
                <div className="d-flex gap-2 w-full flex-row-reverse">
                    <PrimaryButton
                        fullWidth={true}
                        icon={<CheckIcon />}
                        onClick={() => {
                            confirm.callback();
                            hideConfirm();
                        }}
                    />
                    <SecondaryButton
                        fullWidth={true}
                        icon={<CloseIcon />}
                        onClick={() => hideConfirm()}
                    />
                </div>
            </Modal>
        );
    }

    return null;
};
