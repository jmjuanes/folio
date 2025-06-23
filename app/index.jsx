import React from "react";
import {createRoot} from "react-dom/client";
import {useToggle} from "react-use";
import {ConfirmProvider} from "folio-react/contexts/confirm.jsx";
import {DialogsProvider} from "folio-react/contexts/dialogs.jsx";
import {Sidebar, SidebarToggle} from "./components/sidebar.jsx";
import {Welcome} from "./components/welcome.jsx";
import {Board} from "./components/board.jsx";
import {ClientProvider} from "./contexts/client.jsx";
import {AuthenticationProvider} from "./contexts/authentication.jsx";
import {BoardsProvider} from "./contexts/boards.jsx";
import {useHash} from "./hooks/use-hash.js";

// @description main app component
const App = () => {
    const [sidebarVisible, toggleSidebarVisible] = useToggle(true);
    const [hash] = useHash();
    return (
        <div className="fixed top-0 left-0 h-full w-full bg-white text-base text-gray-800 flex">
            {sidebarVisible && (
                <Sidebar />
            )}
            <SidebarToggle
                sidebarVisible={sidebarVisible}
                style={{
                    transform: "translateY(-50%)",
                }}
                onToggle={() => toggleSidebarVisible()}
            />
            {hash === "" && <Welcome />}
            {hash !== "" && <Board key={hash} id={hash} />}
        </div>
    );
};

createRoot(document.getElementById("root")).render((
    <ClientProvider>
        <AuthenticationProvider>
            <ConfirmProvider>
                <BoardsProvider>
                    <DialogsProvider>
                        <App />
                    </DialogsProvider>
                </BoardsProvider>
            </ConfirmProvider>
        </AuthenticationProvider>
    </ClientProvider>
));
