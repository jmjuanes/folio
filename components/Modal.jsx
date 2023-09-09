import React from "react";
import {CloseIcon} from "@josemi-icons/react";

export const Modal = props => (
    <React.Fragment>
        <div className="fixed w-full h-full bg-gray-900 o-50 z-9 top-0 left-0" />
        <div className="fixed w-full h-full flex items-center justify-center z-10 top-0 left-0">
            <div className="rounded-xl border-2 border-gray-900 bg-white w-full p-8" style={{maxWidth: props.maxWidth}}>
                {!!props.onClose && (
                    <div className="flex items-center justify-end">
                        <div className="flex p-2" onClick={props.onClose}>
                            <div className="flex text-4xl text-gray-500 cursor-pointer">
                                <CloseIcon />
                            </div>
                        </div>
                    </div>
                )}
                {props.children}
            </div>          
        </div>
    </React.Fragment>
);

Modal.defaultProps = {
    maxWidth: "500px",
    onClose: null,
};
