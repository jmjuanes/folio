import React from "react";
import {LoaderIcon} from "@josemi-icons/react";
import {Button} from "folio-react/components/ui/button.jsx";
import {Centered} from "folio-react/components/ui/centered.jsx";
import {useClient} from "../contexts/client.jsx";

// @description login component
export const Login = () => {
    const client = useClient();
    const [state, setState] = React.useState({});
    const accessTokenRef = React.useRef(null);

    const handleLogin = React.useCallback(() => {
        const accessToken = (accessTokenRef.current?.value || "").trim();
        if (!accessToken) {
            return setState({
                error: `The access token is required to log in.`,
            });
        }
        // try to login with the provided access token
        setState({loading: true});
        client.login(accessToken).catch(error => {
            console.error("Login failed:", error);
            return setState({
                error: `The provided access token is invalid. Please try again.`,
            });
        });
    }, [accessTokenRef, client]);

    return (
        <Centered className="h-screen">
            <div className="w-88 pb-20">
                <div className="font-serif text-7xl mb-6 leading-none font-brand select-none">folio.</div>
                <div className="text-sm text-gray-700 mb-4">
                    <span>Welcome to your private <b>folio</b> instance. You need to log in with your access token to continue.</span>
                </div>
                <div className="mb-5">
                    <input
                        type="text"
                        className="w-full p-2 border-1 border-gray-200 text-gray-950 rounded-md outline-gray-950"
                        placeholder="Enter your access token..."
                        ref={accessTokenRef}
                        disabled={state.loading}
                    />
                    <div className="text-2xs text-gray-600 mt-1">
                        Your access token is printed in the terminal where you run the server. If you don't have it, please contact your administrator.
                    </div>
                </div>
                <div className="w-full">
                    {!state.loading && (
                        <Button className="w-full" onClick={handleLogin}>
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
                {state.error && (
                    <div className="mt-3 text-xs text-gray-600 text-center">
                        {state.error}
                    </div>
                )}
            </div>
        </Centered>
    );
};
