import React from "react";
import {CloseIcon} from "@mochicons/react";

export const Modal = props => (
    <React.Fragment>
        <div className="position-fixed w-full h-full bg-gray-900 o-50 z-9 top-0 left-0" />
        <div className="position-fixed w-full h-full d-flex items-center justify-center z-10 top-0 left-0">
            <div className="r-xl b-solid b-1 b-gray-300 bg-white w-full p-8" style={{maxWidth: props.maxWidth}}>
                {!!props.onClose && (
                    <div className="d-flex items-center justify-end">
                        <div className="d-flex r-full bg-gray-100 bg-gray-200:hover p-2" onClick={props.onClose}>
                            <div className="d-flex text-2xl text-gray-500 cursor-pointer">
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
