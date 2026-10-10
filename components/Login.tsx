import { useRef, useState, useCallback } from "react";
// import { ExclamationCircleIcon } from "@josemi-icons/react";
import { Button } from "folio-react/components/ui/button.tsx";
// import { useConfiguration } from "../contexts/configuration.tsx";
import { useToaster } from "../contexts/Toaster.tsx";
// import type { LoginMessage } from "../contexts/configuration.tsx";
import type { JSX, KeyboardEvent } from "react";
import type { Credentials } from "../lib/clients/types.ts";

// const LoginMessageAlert = ({ title, content }: LoginMessage): React.JSX.Element => {
//     return (
//         <div className="text-xs text-gray-700 mb-4 border-1 border-gray-200 p-3 rounded-md leading-relaxed">
//             <div className="flex items-center gap-1 mb-1">
//                 <div className="flex items-center text-sm">
//                     <ExclamationCircleIcon />
//                 </div>
//                 <div className="font-bold">{title}</div>
//             </div>
//             <div className="">{content}</div>
//         </div>
//     );
// };

export type LoginProps = {
    onLogin: (credentials: Credentials) => Promise<void>;
};

// @description login component
export const Login = (props: LoginProps): JSX.Element => {
    const toaster = useToaster();
    // const websiteConfig = useConfiguration();
    const [loading, setLoading] = useState<boolean>(false);
    const accessTokenRef = useRef<HTMLInputElement>(null);

    const handleLogin = useCallback(() => {
        const accessToken = (accessTokenRef.current?.value || "").trim();
        if (!accessToken) {
            return toaster.error("The access token is required to log in.");
        }

        // try to login with the provided access token
        setLoading(true);
        // client.login({ token: accessToken })
        //     .catch((error: any) => {
        //         toaster.error(error?.message || "An error occurred while logging in.");
        //     })
        //     .finally(() => setLoading(false));
        props.onLogin({ token: accessToken }).catch((error: any) => {
            console.error(error);
            toaster.error(error?.message || "An error occurred while logging in.");
            setLoading(false);
        });
    }, [setLoading, props.onLogin]);

    return (
        <div className="w-full max-w-sm p-8 rounded-3xl border-1 border-gray-200 bg-white shadow-lg">
            <div className="font-bold text-5xl mb-4 leading-none select-none">
                <span>folio.</span>
            </div>
            <div className="text-sm text-gray-700 mb-4">
                <span>You need to log in with your access token to continue.</span>
            </div>
            <div className="mb-5">
                <input
                    type="text"
                    className="w-full p-2 border-1 border-gray-200 text-gray-950 text-sm rounded-md outline-none"
                    placeholder="Enter your access token..."
                    ref={accessTokenRef}
                    disabled={loading}
                    onKeyDown={(event: KeyboardEvent) => {
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
            {/*
            {(websiteConfig.login_messages || []).map((message: LoginMessage, index: number) => (
                <LoginMessageAlert
                    key={index}
                    title={message.title}
                    content={message.content}
                />
            ))}
            */}
            <div className="w-full">
                <Button className="w-full" disabled={loading} onClick={handleLogin}>
                    <span className="font-bold">Continue</span>
                </Button>
            </div>
        </div>
    );
};
