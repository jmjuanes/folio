import React from "react";
import { Loading } from "folio-react/components/loading.jsx";
import { useApi } from "../hooks/use-api.ts";

export type WebsiteEnvironment = "development" | "demo" | "production";

export type Configuration = {
    environment: WebsiteEnvironment;
    title: string;
    show_experimental_warnings: boolean;
};

// main configuration context
const ConfigurationContext = React.createContext<Configuration>(null);

// @description hook to get the configuration
export const useConfiguration = (): Configuration => {
    return React.useContext(ConfigurationContext);
};

// @description configuration context provider
export const ConfigurationProvider = ({ children }): React.JSX.Element => {
    const [ websiteConfig, setWebsiteConfig ] = React.useState<Configuration>(null);
    const api = useApi("");

    // on mount, fetch website configuration for the current environment
    React.useEffect(() => {
        // TODO: we must handle errors when fetching website configuration
        api("GET", "/_config").then(response => {
            setWebsiteConfig(response.data);
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
