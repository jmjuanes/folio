import React from "react";
import classNames from "classnames";
import {CloseIcon} from "@josemi-icons/react";

export const Modal = props => (
    <React.Fragment>
        <div className="fixed w-full h-full bg-white o-70 z-9 top-0 left-0" />
        <div data-testid="modal" className="fixed w-full h-full flex items-center justify-center z-10 top-0 left-0">
            <div className={classNames(props.className, "rounded-lg border border-neutral-200 bg-white w-full p-6 shadow-sm")}>
                <div className="flex items-center justify-between mb-3 select-none">
                    <div data-testid="modal-title" className="flex items-center text-lg font-bold text-neutral-900">
                        <span>{props.title}</span>
                    </div>
                    <div data-testid="modal-close" className="flex group" onClick={props.onClose}>
                        <div className="flex text-2xl text-neutral-500 group-hover:text-neutral-900 cursor-pointer">
                            <CloseIcon />
                        </div>
                    </div>
                </div>
                <div data-testid="modal-content">
                    {props.children}
                </div>
            </div>          
        </div>
    </React.Fragment>
);

Modal.defaultProps = {
    className: "max-w-lg",
    title: "",
    onClose: null,
};
