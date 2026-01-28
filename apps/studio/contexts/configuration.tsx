import React from "react";
import { Loading } from "folio-react/components/loading.jsx";
import { useClient } from "./client.tsx";

export enum WebsiteEnvironment {
    DEVELOPMENT = "development",
    DEMO = "demo",
    PRODUCTION = "production",
};

export type Configuration = {
    environment: WebsiteEnvironment;
    title: string;
    logo?: string;
    favicon?: string;
    hide_experimental_warning: boolean;
    preferences?: any;
};

// main configuration context
const ConfigurationContext = React.createContext<Configuration>(null);

// @description hook to get the configuration
export const useConfiguration = (): Configuration => {
    return React.useContext(ConfigurationContext);
};

// @description configuration context provider
export const ConfigurationProvider = ({ children }): React.JSX.Element => {
    const [websiteConfig, setWebsiteConfig] = React.useState<Configuration>(null);
    const client = useClient();

    // on mount, fetch website configuration for the current environment
    React.useEffect(() => {
        client.config()
            .then(configurationData => setWebsiteConfig(configurationData))
            .catch(error => {
                console.error("Failed to fetch website configuration:");
                console.error(error);
            });
    }, []);

    // update document title and favicon when configuration changes
    // React.useEffect(() => {
    //     if (websiteConfig) {
    //         document.title = websiteConfig.title || "folio.";
    //         if (websiteConfig.favicon) {
    //             let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    //             if (!link) {
    //                 link = document.createElement("link");
    //                 link.rel = "icon";
    //                 document.getElementsByTagName("head")[0].appendChild(link);
    //             }
    //             link.href = websiteConfig.favicon;
    //         }
    //     }
    // }, [websiteConfig]);

    // if the website configuration is not yet loaded, we display a loading screen
    // to avoid rendering the children before the configuration is available
    // this is important because the configuration may contain information that
    // is needed to render the children correctly, such as the environment or title
    if (!websiteConfig) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loading />
            </div>
        );
    }

    // return the configuration context provider with the website configuration
    return (
        <ConfigurationContext.Provider value={websiteConfig}>
            {children}
        </ConfigurationContext.Provider>
    );
};
