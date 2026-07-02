import { createRoot } from "react-dom/client";
import { App } from "./components/app.tsx";
import { ClientsProvider } from "./contexts/clients.tsx";

createRoot(document.getElementById("root") as HTMLDivElement).render((
    <div className="fixed top-0 left-0 h-full w-full bg-white text-base flex">
        <ClientsProvider>
            <App />
        </ClientsProvider>
    </div>
));
