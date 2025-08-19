import React from "react";
import { useRouter, Route, Switch } from "../contexts/router.tsx";
import { Sidebar } from "./sidebar.tsx";
import { Home } from "./home.tsx";
import { Boards } from "./boards.tsx";
import { BoardEditor } from "./board-editor.tsx";

export const App = (): React.JSX.Element => {
    const [ hash ] = useRouter();
    
    return (
        <div className="fixed top-0 left-0 h-full w-full bg-white text-gray-800 flex">
            <Sidebar />
            <Switch>
                <Route test={/^(|home)$/} render={() => (
                    <Home />
                )} />
                <Route test={/^boards$/} render={() => (
                    <Boards />
                )} />
                <Route test={/^b\/\w+$/} render={() => (
                    <BoardEditor
                        key={hash}
                        id={hash.replace(/^b\//, "")}
                    />
                )} />
            </Switch>
        </div>
    );
};
