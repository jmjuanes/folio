import React from "react";

import {
    scrimClass,
    modalClass,
    buttonClass,
    buttonIconClass,
    titleClass,
} from "../styles.js";
import ICONS from "../icons.js";
import {useTranslation} from "../hooks/useTranslation.js";
import {Form} from "./Form.js";

export const ExportDialog = props => {
    const [state, setState] = React.useState({
        includeBackground: false,
        onlySelection: false,
        filename: "untitled.png",
    });
    const {t} = useTranslation();
    const handleExportClick = () => {
        return props.onExport(state);
    };
    return (
        <div className={scrimClass}>
            <div className={modalClass} style={{maxWidth:"400px"}}>
                <div className={titleClass} style={{fontSize:"2.5rem"}}>
                    {t("exportDialog.title")}
                </div>
                <Form
                    value={state}
                    items={{
                        filename: {
                            type: "input",
                            title: t("exportDialog.filenameTitle"),
                            placeholder: "untitled.png",
                        },
                        includeBackground: {
                            type: "switch",
                            title: t("exportDialog.includeBackgroundTitle"),
                        },
                        onlySelection: {
                            type: "switch",
                            title: t("exportDialog.onlySelectionTitle"),
                            helper: t("exportDialog.onlySelectionHelper"),
                        },
                    }}
                    style={{
                        marginBottom: "1.5rem",
                    }}
                    onChange={(key, value) => {
                        setState(prevState => ({
                            ...prevState,
                            [key]: value,
                        }));
                    }}
                />
                <div className={buttonClass} onClick={handleExportClick}>
                    <div className={buttonIconClass}>{ICONS.DOWNLOAD}</div>
                    <div>{t("exportDialog.exportButton")}</div>
                </div>
            </div>
        </div>
    );
};
