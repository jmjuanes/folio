import React from "react";
import { useRouter, Route, Switch } from "../contexts/router.tsx";
import { Sidebar } from "./sidebar.tsx";
import { Home } from "./home.tsx";
import { Board } from "./board.tsx";

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
                    <div>Boards</div>
                )} />
                <Route test={/^\w+$/} render={() => (
                    <Board key={hash} id={hash} />
                )} />
            </Switch>
        </div>
    );
};
