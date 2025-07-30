import React from "react";
import { LoaderIcon } from "@josemi-icons/react";
import { Button } from "folio-react/components/ui/button.jsx";
import { Centered } from "folio-react/components/ui/centered.jsx";
import { Client, useClient } from "../contexts/client.tsx";
import { useConfiguration, WebsiteEnvironment } from "../contexts/configuration.tsx";
import { useToaster } from "../contexts/toaster.tsx";

export type LoadingState = {
    loading?: boolean;
    error?: string;
};

// @description login component
export const Login = (): React.JSX.Element => {
    const toaster = useToaster();
    const client = useClient() as Client;
    const websiteConfig = useConfiguration();
    const [state, setState] = React.useState<LoadingState>({});
    const [experimentalWarningChecked, setExperimentalWarningChecked] = React.useState<boolean>(false);
    const [demoWarningChecked, setDemoWarningChecked] = React.useState<boolean>(false);
    const accessTokenRef = React.useRef<HTMLInputElement>(null);

    const isLoginEnabled = React.useMemo(() => {
        const checks = [true, true];
        if (!websiteConfig.hide_experimental_warning) {
            checks[0] = !!experimentalWarningChecked;
        }
        if (websiteConfig.environment === WebsiteEnvironment.DEMO) {
            checks[1] = !!demoWarningChecked;
        }
        // to enable the login button, all checks must be true
        return checks.every(check => check);
    }, [websiteConfig, experimentalWarningChecked, demoWarningChecked]);

    const handleLogin = React.useCallback(() => {
        if (!isLoginEnabled) {
            return;
        }

        const accessToken = (accessTokenRef.current?.value || "").trim();
        if (!accessToken) {
            return toaster.error("The access token is required to log in.");
        }

        // try to login with the provided access token
        setState({loading: true});
        client.login({ token: accessToken }).catch(response => {
            toaster.error(response.errors[0]?.message || "An error occurred while trying to log in.");
            setState({ loading: false });
        });
    }, [client, isLoginEnabled]);

    return (
        <Centered className="h-screen">
            <div className="w-96 pb-20">
                <div className="font-serif text-5xl mb-4 leading-none font-brand select-none">
                    <span>{websiteConfig.title}</span>
                </div>
                <div className="text-sm text-gray-700 mb-4">
                    <span>You need to log in with your access token to continue.</span>
                </div>
                <div className="mb-5">
                    <input
                        type="text"
                        className="w-full p-2 border-1 border-gray-200 text-gray-950 text-sm rounded-md outline-gray-950"
                        placeholder="Enter your access token..."
                        ref={accessTokenRef}
                        disabled={state.loading}
                        onKeyDown={(event: React.KeyboardEvent) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                handleLogin();
                            }
                        }}
                    />
                    <div className="text-2xs text-gray-600 mt-1">
                        Your access token is printed in the terminal where you run the server. If you don't have it, please contact your administrator.
                    </div>
                </div>
                {!websiteConfig.hide_experimental_warning && (
                    <div className="mb-5">
                        <div className="text-xs text-gray-700 mb-4 border-1 border-gray-200 p-3 rounded-md leading-relaxed">
                            <div className="mb-2">
                                <b>Warning:</b> This application is in an <b>experimental state</b>.
                            </div>
                            <div className="">
                                Some features may not work correctly or may contain bugs. 
                                There may be changes between versions that could result in data loss. By using this tool, you are responsible for making regular backups of any stored information.
                            </div>
                        </div>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="rounded-md border-1 border-gray-200 text-gray-950"
                                disabled={state.loading}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    setExperimentalWarningChecked(event.target.checked);
                                }}
                            />
                            <span className="ml-2 text-sm text-gray-700 leading-none">
                                I have read and understood the experimental warning.
                            </span>
                        </label>
                    </div>
                )}
                {websiteConfig.environment === WebsiteEnvironment.DEMO && (
                    <div className="mb-5">
                        <div className="text-xs text-gray-700 mb-4 border-1 border-gray-200 p-3 rounded-md leading-relaxed">
                            <div className="mb-2">
                                <b>Warning:</b> This is a temporary demo environment.
                            </div>
                            <div>
                                Any information you store here is not permanent and will be deleted when the server becomes inactive. Please do not use this environment for storing important data.
                            </div>
                            <div className="mt-2">
                                <b>Note:</b> Information stored in this environment can be viewed by any other user.
                            </div>
                        </div>
                        <label className="flex items-start cursor-pointer">
                            <div className="shrink-0 flex mt-1">
                                <input
                                    type="checkbox"
                                    className="rounded-md border-1 border-gray-200 text-gray-950 cursor-pointer"
                                    disabled={state.loading}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setDemoWarningChecked(event.target.checked);
                                    }}
                                />
                            </div>
                            <span className="ml-2 text-sm text-gray-700">
                                I understand that this is a demo environment and that any information stored here is not permanent.
                            </span>
                        </label>
                    </div>
                )}
                <div className="w-full">
                    {!state.loading && (
                        <Button className="w-full" disabled={!isLoginEnabled} onClick={handleLogin}>
                            <span>Continue</span>
                        </Button>
                    )}
                    {state.loading && (
                        <div className="flex items-center justify-center w-full">
                            <div className="flex animation-spin text-gray-600 text-lg">
                                <LoaderIcon />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Centered>
    );
};
