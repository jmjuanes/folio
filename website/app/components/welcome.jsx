import React from "react";
import {
    renderIcon,
    DrawingIcon,
    FolderIcon,
} from "@josemi-icons/react";
import {Button} from "folio-react/components/ui/button.jsx";
import {Centered} from "folio-react/components/ui/centered.jsx";
import {Overlay} from "folio-react/components/ui/overlay.jsx";
import {useEditor} from "folio-react/contexts/editor.jsx";
import {loadFromJson} from "folio-react/lib/json.js";

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

export const WelcomeDialog = () => {
    const editor = useEditor();
    const [welcomeVisible, setWelcomeVisible] = React.useState(() => {
        return editor.pages?.length === 1 && editor.page?.elements?.length === 0;
    });

    // handle load board from file
    const handleLoad = React.useCallback(() => {
        loadFromJson()
            .then(data => {
                editor.fromJSON(data);
                editor.dispatchChange();
                editor.update();
                setWelcomeVisible(false);
            })
            .catch(error => console.error(error));
    }, [editor, setWelcomeVisible]);

    // handle start drawing
    const handleStartDrawing = React.useCallback(() => {
        setWelcomeVisible(false);
    }, [setWelcomeVisible]);

    // if welcome is not visible, we don't need to render it
    if (!welcomeVisible) {
        return null;
    }

    return (
        <React.Fragment>
            <Overlay className="z-50" />
            <Centered className="fixed h-full z-50">
                <div className="w-full max-w-lg p-8 rounded-3xl border border-neutral-200 bg-white shadow-lg">
                    <div className="pt-12 pb-4 select-none">
                        <div className="font-black text-5xl mb-6 leading-none">
                            <span>Hello 👋</span>
                        </div>
                        <div className="">
                            Welcome to <b>folio</b>, our work-in-progress minimal digital whiteboard for sketching and prototyping.
                        </div>
                    </div>
                    <div className="flex gap-2 w-full pb-6">
                        {defaultWelcomeFeatures.map(feature => (
                            <div key={feature.title} className="rounded-md p-4 w-full">
                                <div className="text-3xl flex mb-1">
                                    {renderIcon(feature.icon)}
                                </div>
                                <div className="text-sm font-bold">
                                    {feature.title}
                                </div>
                                <div className="text-2xs">
                                    {feature.description}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                        <Button className="w-full" onClick={handleStartDrawing}>
                            <div className="flex items-center text-lg">
                                <DrawingIcon />
                            </div>
                            <div className="font-bold">Start drawing</div>
                        </Button>
                        <Button variant="secondary" className="w-full" onClick={handleLoad}>
                            <div className="flex items-center text-lg">
                                <FolderIcon />
                            </div>
                            <div className="font-medium">Load from file</div>
                        </Button>
                    </div>
                    <div className="text-center text-xs select-none">
                        <span><b>folio</b> v{process.env.VERSION}</span> 
                    </div>
                </div>
            </Centered>
        </React.Fragment>
    );
};
