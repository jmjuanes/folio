import { useState, useCallback, useMemo } from "react";
import { ExclamationCircleIcon } from "@josemi-icons/react";
import { Button, ButtonVariant } from "folio-react/components/ui/button.tsx";
import { Form } from "folio-react/components/form/index.jsx";
import { FORM_OPTIONS } from "folio-react/constants.js";
import { useSession } from "../contexts/session.tsx";
import type { JSX } from "react";

export const Connection = (): JSX.Element => {
    const session = useSession();
    const [credentials, setCredentials] = useState({});

    // build the form from the fields declared by the client of this installation
    const formFields = useMemo(() => {
        const entries = session.fields || {};
        return Object.fromEntries(Object.keys(entries).map(field => {
            return [field, {
                type: FORM_OPTIONS.TEXT,
                title: entries[field].label,
                helper: entries[field].description,
                className: "mb-1",
            }];
        }));
    }, [session.fields]);

    // submit form -> send the credentials object to the session.connect
    const handleSubmit = useCallback(() => {
        session.connect(credentials);
    }, [session.connect, credentials]);

    // disable buttons and input elements when the session status is connecting
    const isDisabled = session.status === "connecting";

    return (
        <div className="w-full max-w-sm p-8 rounded-3xl border-1 border-gray-200 bg-white shadow-lg">
            <div className="font-bold text-5xl mb-4 leading-none select-none">
                <span>folio.</span>
            </div>
            {Object.keys(formFields).length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                    <Form
                        items={formFields}
                        data={credentials}
                        onChange={(key: string, value: string) => {
                            setCredentials(prevData => {
                                return { ...prevData, [key]: value };
                            });
                        }}
                    />
                </div>
            )}
            <div className="flex flex-col items-center">
                <Button disabled={isDisabled} variant={ButtonVariant.PRIMARY} className="w-full" onClick={handleSubmit}>
                    <span>Connect</span>
                </Button>
                {session.error && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-red-500">
                        <div className="flex items-center text-xs leading-none">
                            <ExclamationCircleIcon />
                        </div>
                        <div className="leading-none">{session.error.message}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
