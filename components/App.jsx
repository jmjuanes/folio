import React from "react";
import classNames from "classnames";
import {PlusIcon, renderIcon} from "@josemi-icons/react";
import {Route, Switch, useRouter} from "../contexts/RouterContext.jsx";

import {HomePage} from "../pages/HomePage.jsx";
import {BoardPage} from "../pages/BoardPage.jsx";
import {NewPage} from "../pages/NewPage.jsx";

const NavigationItem = props => {
    const {currentPath} = useRouter();
    const classList = classNames({
        "no-underline flex flex-col items-center gap-1 w-full py-2 rounded-xl select-none": true,
        "cursor-pointer hover:bg-white text-white hover:text-gray-900": currentPath !== props.path,
        "bg-white text-gray-900": currentPath === props.path,
    });
    return (
        <a href={props.path} className={classList}>
            <div className="flex text-4xl">
                {renderIcon(props.icon)}
            </div>
            <div className="text-3xs font-bold">{props.text}</div>
        </a>
    );
};

export const App = () => (
    <Switch>
        {/* Board route */}
        <Route test={/^#board\/(\w+)$/} render={() => (
            <div className="fixed top-0 left-0 h-full w-full bg-white text-base text-gray-700">
                <BoardPage />
            </div>
        )} />
        {/* New board route */}
        <Route test={/^#new$/} render={() => (
            <NewPage />
        )} />
        {/* Other case, render app dashboard */}
        <Route test="*" render={() => (
            <div className="w-full flex gap-4 minh-0 animation-fadein">
                <div className="w-24 h-screen minh-0 sticky top-0 flex flex-col gap-2 justify-between px-4 py-8 bg-black">
                    <div className="w-full flex flex-col gap-4">
                        <a href="#new" className="flex justify-center cursor-pointer no-underline">
                            <div className="rounded-full border-2 border-white hover:bg-white text-white hover:text-gray-900 p-3 flex items-center justify-center cursor-pointer">
                                <div className="flex text-3xl">
                                    <PlusIcon />
                                </div>
                            </div>
                        </a>
                        <div className="bg-gray-300 w-full h-px" />
                        <NavigationItem path="#" text="Home" icon="home" />
                        <NavigationItem path="#settings" text="Settings" icon="cog" />
                    </div>
                </div>
                <div className="w-full maxw-7xl mx-auto px-8 minh-0">
                    <Route test={/(^#$)|(^#home$)/} render={() => (
                        <HomePage />
                    )} />
                    {/* Footer section */}
                    <div className="w-full pt-20 pb-20">
                        <div className="w-full border-t-2 border-gray-900 mb-16" />
                        <div className="flex flex-col">
                            <div className="text-sm mb-2">
                                <span><b>Folio</b> v{process.env.VERSION}</span>
                            </div>
                            <div className="text-xs text-gray-600 mb-1">
                                Designed by <a href="https://www.josemi.xyz" target="_blank" className="font-bold hover:underline">Josemi</a> in Valencia, Spain.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )} />
    </Switch>
);
