import React from "react";
import {CloseIcon, CheckIcon} from "@mochicons/react";
import {useConfirm} from "../contexts/ConfirmContext.jsx";
import {Modal} from "./Modal.jsx";
import {Button} from "./Button.jsx";

export const Confirm = () => {
    const {confirm, hideConfirm} = useConfirm();

    if (confirm.visible) {
        return (
            <Modal maxWidth="400px">
                <div className="pb:8 text:center">
                    {confirm.message}
                </div>
                <div className="d:flex gap:2 w:full flex:row-reverse">
                    <Button
                        className="w:full bg:dark-700 bg:dark-900:hover text:white"
                        icon={<CheckIcon />}
                        onClick={() => {
                            confirm.callback();
                            hideConfirm();
                        }}
                    />
                    <Button
                        className="w:full bg:light-300:hover text:dark-700"
                        icon={<CloseIcon />}
                        onClick={() => hideConfirm()}
                    />
                </div>
            </Modal>
        );
    }

    return null;
};
