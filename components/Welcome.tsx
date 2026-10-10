import { useCallback, useState } from "react";
import { renderIcon, DrawingIcon, FolderIcon, XIcon } from "@josemi-icons/react";
import { Button } from "folio-react/components/ui/button.tsx";
import { loadFromJson } from "folio-react/lib/json.js";
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

export type WelcomeProps = {
    onClose?: () => void;
};

export const Welcome = (props: WelcomeProps): JSX.Element => {
    // const editor = useEditor();
    const [welcomeVisible, setWelcomeVisible] = useState(() => {
        // return editor.pages?.length === 1 && editor.page?.elements?.length === 0;
        return true;
    });

    // handle load board from file
    const handleLoad = useCallback(() => {
        // loadFromJson()
        //     .then(data => {
        //         editor.fromJSON(data);
        //         editor.dispatchChange();
        //         editor.update();
        //         setWelcomeVisible(false);
        //     })
        //     .catch(error => console.error(error));
    }, [setWelcomeVisible]);

    // handle start drawing
    const handleStartDrawing = useCallback(() => {
        setWelcomeVisible(false);
    }, [setWelcomeVisible]);

    return (
        <div className="relative w-full max-w-lg p-8 rounded-3xl border-1 border-gray-200 bg-white shadow-lg">
            <div className="absolute top-0 right-0 mt-8 mr-8">
                <div className="text-3xl cursor-pointer opacity-70 hover:opacity-100" onClick={props.onClose}>
                    <XIcon />
                </div>
            </div>
            <div className="pt-12 pb-8 select-none">
                <div className="mb-4 leading-none">
                    <span className="font-bold text-7xl tracking-tight">folio.</span>
                </div>
                <div className="">
                    Welcome to <b>folio</b>, the minimal and infinite whiteboard for sketching and prototyping.
                </div>
            </div>
            <div className="flex gap-2 w-full pb-6">
                {defaultWelcomeFeatures.map(feature => (
                    <div key={feature.title} className="rounded-md p-4 w-full bg-gray-100">
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
            <div className="text-center text-xs text-gray-600 select-none">
                <span><b>folio</b> v{process.env.VERSION}</span>
            </div>
        </div>
    );
};
