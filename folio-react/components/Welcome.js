import React from "react";

import {css, scrimClass, titleClass} from "../styles.js";
import ICONS from "../icons.js";
import {DEFAULT_APP_TITLE} from "../constants.js";
import {useTranslation} from "../hooks/useTranslation.js";

const welcomeClass = css({
    apply: "mixins.bordered",
    backgroundColor: "#fff",
    display: "block",
    maxWidth: "500px",
    padding: "2.5rem",
    width: "100%",
});
const welcomeTitleClass = css({
    fontSize: "5.5rem",
    marginBottom: "0.125rem",
    textAlign: "center",
});

const buttonContainerClass = css({
    display: "flex",
    // flexDirection: "column",
    gap: "0.5rem",
});

const buttonClass = css({
    apply: "mixins.bordered",
    alignItems: "center",
    color: "primary",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "1rem",
    width: "100%",
    "&:hover": {
        backgroundColor: "primary",
        color: "white",
    },
});
const buttonTextClass = css({
    fontSize: "0.875rem",
    fontWeight: "bold",
});

const versionClass = css({
    color: "muted",
    fontSize: "0.75rem",
    marginTop: "1rem",
    textAlign: "center",
});

export const WelcomeDialog = props => {
    const {t} = useTranslation();
    return (
        <div className={scrimClass}>
            <div className={welcomeClass}>
                <div className={[titleClass, welcomeTitleClass].join(" ")}>
                    {DEFAULT_APP_TITLE}
                </div>
                <div style={{marginBottom:"1.5rem"}} align="center">
                    {t("welcomeDialog.description")}
                </div>
                <div className={buttonContainerClass}>
                    <div className={buttonClass} onClick={props.onDismissClick}>
                        <div style={{fontSize: "3rem"}}>{ICONS.EDIT}</div>
                        <div className={buttonTextClass}>{t("welcomeDialog.createButton")}</div>
                    </div>
                    <div className={buttonClass} onClick={props.onLoadClick}>
                        <div style={{fontSize: "3rem"}}>{ICONS.UPLOAD}</div>
                        <div className={buttonTextClass}>{t("welcomeDialog.uploadButton")}</div>
                    </div>
                </div>
                <div className={versionClass}>
                    {t("welcomeDialog.version")} <b>v{process.env.VERSION}</b>
                </div>
            </div>
        </div>
    );
};
