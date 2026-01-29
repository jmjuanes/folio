import React from "react";
import { ExclamationCircleIcon } from "@josemi-icons/react";
import { Button } from "folio-react/components/ui/button.jsx";
import { Centered } from "folio-react/components/ui/centered.jsx";
import { useConfiguration } from "../contexts/configuration.tsx";
import { useToaster } from "../contexts/toaster.tsx";
import { useClient } from "../contexts/client.tsx";
import type { LoginMessage } from "../contexts/configuration.tsx";

const LoginMessageAlert = ({ title, content }: LoginMessage): React.JSX.Element => {
    return (
        <div className="text-xs text-gray-700 mb-4 border-1 border-gray-200 p-3 rounded-md leading-relaxed">
            <div className="flex items-center gap-1 mb-1">
                <div className="flex items-center text-sm">
                    <ExclamationCircleIcon />
                </div>
                <div className="font-bold">{title}</div>
            </div>
            <div className="">{content}</div>
        </div>
    );
};

// @description login component
export const Login = (): React.JSX.Element => {
    const toaster = useToaster();
    const client = useClient();
    const websiteConfig = useConfiguration();
    const [loading, setLoading] = React.useState<boolean>(false);
    const accessTokenRef = React.useRef<HTMLInputElement>(null);

    const handleLogin = React.useCallback(() => {
        const accessToken = (accessTokenRef.current?.value || "").trim();
        if (!accessToken) {
            return toaster.error("The access token is required to log in.");
        }

        // try to login with the provided access token
        setLoading(true);
        client.login({ token: accessToken })
            .catch(error => {
                toaster.error(error?.message || "An error occurred while logging in.");
            })
            .finally(() => setLoading(false));
    }, [client]);

    return (
        <Centered className="h-screen">
            <div className="w-96 pb-20">
                <div className="font-serif text-5xl mb-4 leading-none font-brand select-none">
                    <span>{websiteConfig.login_title || websiteConfig.title || "folio."}</span>
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
                        disabled={loading}
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
                {(websiteConfig.login_messages || []).map((message: LoginMessage, index: number) => (
                    <LoginMessageAlert
                        key={index}
                        title={message.title}
                        content={message.content}
                    />
                ))}
                <div className="w-full">
                    <Button className="w-full" disabled={loading} onClick={handleLogin}>
                        <span className="font-bold">Continue</span>
                    </Button>
                </div>
            </div>
        </Centered>
    );
};
