import { Fragment, useMemo } from "react";
import { renderIcon, DrawingIcon, FolderIcon } from "@josemi-icons/react";
import { Button } from "./ui/button.tsx";
import { Centered } from "./ui/centered.tsx";
import { Overlay } from "./ui/overlay.tsx";
import { useApp } from "../hooks/use-app.ts";
import { getConfig } from "../lib/config.ts";
import type { JSX } from "react";

export const WelcomeContent = (): JSX.Element => {
    const app = useApp();
    const features = useMemo(() => {
        return getConfig("ui.welcome.features") || [];
    }, []);

    return (
        <div className="w-full max-w-lg p-8 rounded-3xl border-1 border-gray-200 bg-white shadow-lg">
            <div className="pt-12 pb-8 select-none">
                <div className="mb-4 leading-none">
                    <span className="font-bold text-7xl tracking-tight">folio</span>
                    <span className="font-medium text-7xl text-gray-600 tracking-tight">lite</span>
                </div>
                <div className="">
                    Welcome to <b>folio</b>, the minimal and infinite whiteboard for sketching and prototyping.
                </div>
            </div>
            {features.length > 0 && (
                <div className="flex gap-2 w-full pb-6">
                    {features.map(feature => (
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
            )}
            <div className="flex items-center gap-2 mb-6">
                <Button className="w-full" onClick={() => app.createDocument()}>
                    <div className="flex items-center text-lg">
                        <DrawingIcon />
                    </div>
                    <div className="font-bold">Start drawing</div>
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => app.importDocument()}>
                    <div className="flex items-center text-lg">
                        <FolderIcon />
                    </div>
                    <div className="font-medium">Load from file</div>
                </Button>
            </div>
        </div>
    );
};

export const Welcome = (): JSX.Element => {
    return (
        <Fragment>
            <Overlay className="z-50 glass" />
            <Centered className="fixed h-full z-50">
                <WelcomeContent />
            </Centered>
        </Fragment>
    );
};
