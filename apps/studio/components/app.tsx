import React from "react";
import { useRouter, Route, Switch } from "../contexts/router.tsx";
import { Sidebar } from "./sidebar.tsx";
import { HomeRoute } from "./routes/home.tsx";
import { EditorRoute } from "./routes/editor.tsx";
import { NotFound } from "./not-found.tsx";

export const App = (): React.JSX.Element => {
    const [ hash ] = useRouter();
    
    return (
        <div className="fixed top-0 left-0 h-full w-full bg-white text-gray-800 flex">
            <Sidebar />
            <Switch>
                <Route test={/^#(|home)$/} render={() => (
                    <HomeRoute />
                )} />
                <Route test={/^#[\w-]+$/} render={() => (
                    <EditorRoute
                        key={hash}
                        id={hash.replace(/^#/, "")}
                    />
                )} />
                <Route test="*" render={() => (
                    <NotFound />
                )} />
            </Switch>
        </div>
    );
};
