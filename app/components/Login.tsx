import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "folio-react/components/ui/button.tsx";
import { Centered } from "folio-react/components/ui/centered.tsx";
import { useToaster } from "../contexts/toaster.tsx";
import { useClients } from "../contexts/clients.tsx";
import { Logo } from "./Logo.tsx";
// import { useConfiguration } from "../contexts/configuration.tsx";

import * as formStyles from "folio-react/styles/form.css";
import * as styles from "../styles/components.css";

import type { JSX } from "react";

// const LoginMessageAlert = ({ title, content }: { title: string, content: string }): JSX.Element => {
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

// @description login component
export const Login = (): JSX.Element => {
    const navigate = useNavigate();
    const toaster = useToaster();
    // const configuration = useConfiguration();
    const { authentication } = useClients();
    const [loading, setLoading] = useState<boolean>(false);
    const accessTokenRef = useRef<HTMLInputElement>(null);

    // get visible title
    // const title = configuration?.login_title || configuration?.title || null;

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
        <Centered style={{ height: "100%" }}>
            <div className={styles.login}>
                <div className={styles.loginTitle}>
                    <Logo />
                </div>
                <div className={styles.loginDescription}>
                    <span>You need to log in with your access token to continue.</span>
                </div>
                <div className={formStyles.formField}>
                    <input
                        type="text"
                        className={formStyles.formInput}
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
                    <div className={formStyles.formHelper}>
                        Your access token is printed in the terminal where you run the server. If you don't have it, please contact your administrator.
                    </div>
                </div>
                <div>
                    <Button style={{ width: "100%" }} disabled={loading} onClick={handleLogin}>
                        <span style={{ fontWeight: "bold" }}>Continue</span>
                    </Button>
                </div>
            </div>
        </Centered>
    );
};
