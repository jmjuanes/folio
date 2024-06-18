import React from "react";
import {CloseIcon} from "@josemi-icons/react";

export const Banner = () => {
    const [visible, setVisible] = React.useState(true);
    if (!visible) {
        return null;
    }
    return (
        <div className="w-full p-4 bg-neutral-950 text-white flex items-center gap-4">
            <div className="w-full">
                <div className="font-bold mb-0">We have a new home for folio!</div>
                <div className="text-sm ">
                    <span>Please visit our new URL at <a href="https://folio.josemi.xyz" target="_blank" className="font-bold hover:underline">folio.josemi.xyz</a>. </span>
                    <span>Note that <b>this legacy version will no longer receive updates</b>, </span>
                    <span>so do not forget to export (<i className="font-bold">Menu -{">"} Save as...</i>) your current whiteboard from here and import them into the new folio app.</span>
                </div>
            </div>
            <div className="flex items-center shrink-0">
                <div className="flex items-center text-4xl cursor-pointer hover:o-80" onClick={() => setVisible(false)}>
                    <CloseIcon />
                </div>
            </div>
        </div>
    );
};
