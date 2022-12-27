import React from "react";
import {HeaderButton} from "./HeaderButton.jsx";
import {DownloadIcon} from "../icons/index.jsx";

export const HeaderBar = props => {
    return (
        <div className="d:flex w:full h:16 py:2 px:4 bg:white gap:4">
            {props.showLogo && !!props.logo && (
                <div className="h:12 w:12">
                    <img src={props.logo} width="100%" height="100%" />
                </div>
            )}
            {props.showTitle && (
                <div className="d:flex items:center justify:center select:none">
                    <span className="font:bold text:lg">{props.title}</span>
                </div>
            )}
            {props.showExport && (
                <div className="ml:auto d:flex items:center justify:center">
                    {props.showExport && (
                        <HeaderButton text="Export" onClick={props.onExport}>
                            <DownloadIcon />
                        </HeaderButton>
                    )}
                </div>
            )}
        </div>
    );
};

HeaderBar.defaultProps = {
    title: "Untitled",
    logo: "",
    showLogo: true,
    showTitle: true,
    showExport: true,
    onExport: null,
};
