import React from "react";
import {
    renderIcon,
    DrawingIcon,
    FolderIcon,
} from "@josemi-icons/react";
import {Button} from "folio-react/components/ui/button.jsx";
import {Centered} from "folio-react/components/ui/centered.jsx";
import {Overlay} from "folio-react/components/ui/overlay.jsx";

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

export const WelcomeDialog = props => (
    <React.Fragment>
        <Overlay className="z-50" />
        <Centered className="fixed h-full z-50">
            <div className={themed("w-full max-w-lg p-8 rounded-lg", "welcome")}>
                <div className="pt-12 pb-4 select-none">
                    <div className={themed("font-black text-5xl mb-6 leading-none", "welcome.title")}>
                        <span>Hello 👋</span>
                    </div>
                    <div className={themed("", "welcome.description")}>
                        Welcome to <b>folio</b>, our work-in-progress minimal digital whiteboard for sketching and prototyping.
                    </div>
                </div>
                <div className="flex gap-2 w-full pb-6">
                    {defaultWelcomeFeatures.map(feature => (
                        <div key={feature.title} className={themed("rounded-md p-4 w-full", "welcome.feature")}>
                            <div className={themed("text-3xl flex mb-1", "welcome.feature.icon")}>
                                {renderIcon(feature.icon)}
                            </div>
                            <div className={themed("text-sm font-bold", "welcome.feature.title")}>
                                {feature.title}
                            </div>
                            <div className={themed("text-2xs", "welcome.feature.description")}>
                                {feature.description}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 mb-6">
                    <Button className="w-full" onClick={props.onCreate}>
                        <div className="flex items-center text-lg">
                            <DrawingIcon />
                        </div>
                        <div className="font-bold">Start drawing</div>
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={props.onLoad}>
                        <div className="flex items-center text-lg">
                            <FolderIcon />
                        </div>
                        <div className="font-medium">Load from file</div>
                    </Button>
                </div>
                <div className={themed("text-center text-xs select-none", "welcome.version")}>
                    <span><b>folio</b> v{process.env.VERSION}</span> 
                </div>
            </div>
        </Centered>
    </React.Fragment>
);
