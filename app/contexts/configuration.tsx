import { useContext, createContext, useState, useEffect } from "react";
import { Loading } from "folio-react/components/loading.jsx";
import profile from "@profile";
import type { JSX, PropsWithChildren } from "react";

const ConfigurationContext = createContext<any>(null);

const getConfigurationFromProfile = (): Promise<any> => {
    // 1. check for object
    if (typeof profile.config === "object") {
        return Promise.resolve(profile.config);
    }
    // 2. check for promise to resolve configuration
    if (typeof profile.config === "function") {
        return profile.config();
    }
    // 3. return empty object
    return Promise.resolve({});
};

// @description hook to get the configuration
export const useConfiguration = (): any => {
    return useContext(ConfigurationContext);
};

// @description configuration context provider
export const ConfigurationProvider = (props: PropsWithChildren): JSX.Element => {
    const [websiteConfig, setWebsiteConfig] = useState<any>(null);

    // on mount, fetch website configuration for the current environment
    useEffect(() => {
        getConfigurationFromProfile().then(config => {
            setWebsiteConfig(config);
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
        <ConfigurationContext value={websiteConfig}>
            {props.children}
        </ConfigurationContext>
    );
};
