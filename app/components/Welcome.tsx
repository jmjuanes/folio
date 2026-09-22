import { Fragment, useCallback } from "react";
import { useNavigate } from "react-router";
import { renderIcon, DrawingIcon, FolderIcon } from "@josemi-icons/react";
import { Button } from "folio-react/components/ui/button.tsx";
import { Centered } from "folio-react/components/ui/centered.tsx";
import { Overlay, OverlayVariant } from "folio-react/components/ui/overlay.tsx";
import * as styles from "../styles/components.css";
// import { loadFromJson } from "folio-react/lib/json.js";
import type { JSX } from "react";

const defaultWelcomeFeatures = [
    {
        icon: "shield-check",
        title: "Privacy First.",
        description: "Folio uses the local storage of your browser to ensure that your drawings are accessible only to you.",
    },
    {
        icon: "drawing",
        title: "Boundless Canvas.",
        description: "Unleash your imagination on an infinite canvas for sketching, prototyping, and creating.",
    },
];

export const Welcome = (): JSX.Element => {
    const navigate = useNavigate();
    const handleLoad = useCallback(() => {
        // loadFromJson()
        //     .then(data => {
        //         editor.fromJSON(data);
        //         editor.dispatchChange();
        //         editor.update();
        //         setWelcomeVisible(false);
        //     })
        //     .catch(error => console.error(error));
        navigate("/board");
    }, [navigate]);
    const handleStartDrawing = useCallback(() => {
        navigate("/board");
    }, [navigate]);

    return (
        <Fragment>
            <Overlay variant={OverlayVariant.TRANSPARENT} className={styles.welcomeOverlay} />
            <Centered className={styles.welcomeCentered}>
                <div className={styles.welcomeCard}>
                    <div className={styles.welcomeHeader}>
                        <div className={styles.welcomeLogo}>
                            <span>Folio.</span>
                        </div>
                        <div className="">
                            Welcome to <b>folio</b>, the minimal and infinite whiteboard for sketching and prototyping.
                        </div>
                    </div>
                    <div className={styles.welcomeFeatures}>
                        {defaultWelcomeFeatures.map(feature => (
                            <div key={feature.title} className={styles.welcomeFeatureCard}>
                                <div className={styles.welcomeFeatureIcon}>
                                    {renderIcon(feature.icon)}
                                </div>
                                <div className={styles.welcomeFeatureTitle}>
                                    {feature.title}
                                </div>
                                <div className={styles.welcomeFeatureDescription}>
                                    {feature.description}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.welcomeActions}>
                        <Button style={{ width: "100%"}} onClick={handleStartDrawing}>
                            <div className={styles.welcomeActionIcon}>
                                <DrawingIcon />
                            </div>
                            <div style={{ fontWeight: "bold"}}>Start drawing</div>
                        </Button>
                        <Button variant="secondary" style={{ width: "100%" }} onClick={handleLoad}>
                            <div className={styles.welcomeActionIcon}>
                                <FolderIcon />
                            </div>
                            <div style={{ fontWeight: "500" }}>Load from file</div>
                        </Button>
                    </div>
                    <div className={styles.welcomeFooter}>
                        <span><b>folio</b> v{process.env.VERSION}</span>
                    </div>
                </div>
            </Centered>
        </Fragment>
    );
};
