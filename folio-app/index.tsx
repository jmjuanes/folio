import { createRoot } from "react-dom/client";
import { App } from "./components/app.tsx";
import { ConfigurationProvider } from "./contexts/configuration.tsx";
import { ClientsProvider } from "./contexts/clients.tsx";
import { ToasterProvider } from "./contexts/toaster.tsx";

createRoot(document.getElementById("root") as HTMLDivElement).render((
    <div className="fixed top-0 left-0 h-full w-full bg-white text-base flex">
        <ToasterProvider>
            <ConfigurationProvider>
                <ClientsProvider>
                    <App />
                </ClientsProvider>
            </ConfigurationProvider>
        </ToasterProvider>
    </div>
));
