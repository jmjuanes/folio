import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { ExclamationCircleIcon } from "@josemi-icons/react";
import { Button } from "folio-react/components/ui/button.tsx";
import { Centered } from "folio-react/components/ui/centered.tsx";
import { useToaster } from "../contexts/toaster.tsx";
import { useClients } from "../contexts/clients.tsx";
import { useConfiguration } from "../contexts/configuration.tsx";
import type { JSX } from "react";

const LoginMessageAlert = ({ title, content }: { title: string, content: string }): JSX.Element => {
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
export const Login = (): JSX.Element => {
    const navigate = useNavigate();
    const toaster = useToaster();
    const configuration = useConfiguration();
    const { authentication } = useClients();
    const [loading, setLoading] = useState<boolean>(false);
    const accessTokenRef = useRef<HTMLInputElement>(null);

    const handleLogin = useCallback(() => {
        const accessToken = (accessTokenRef.current?.value || "").trim();
        if (!accessToken) {
            return toaster.error("The access token is required to log in.");
        }

        // try to login with the provided access token
        setLoading(true);
        authentication?.login({ token: accessToken })
            .then(() => {
                navigate("/");
            })
            .catch(error => {
                toaster.error(error?.message || "An error occurred while logging in.");
                setLoading(false);
            });
    }, [authentication]);

    return (
        <Centered className="h-screen">
            <div className="w-96 pb-20">
                <div className="font-serif text-5xl mb-4 leading-none font-brand select-none">
                    <span>{configuration?.login_title || configuration?.title || "folio."}</span>
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
                {(configuration?.login_messages || []).map((message: any, index: number) => (
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
