import React from "react";
import { Loading } from "folio-react/components/loading.jsx";
import { useClient } from "./client.tsx";

export type LoginMessage = {
    title: string;
    content: string;
};

export type Configuration = {
    title?: string;
    favicon?: string;
    login_title?: string;
    login_messages?: LoginMessage[];
    sidebar_title?: string;
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
