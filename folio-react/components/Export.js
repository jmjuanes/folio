import React from "react";

import {
    buttonClass,
    buttonIconClass,
} from "../styles.js";
import ICONS from "../icons.js";
import {useTranslation} from "../hooks/useTranslation.js";
import {Modal} from "./Modal.js";
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
        <Modal title={t("exportDialog.title")} width="400px" onClose={props.onCancel}>
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
        </Modal>
    );
};
