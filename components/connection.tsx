import { useState, useCallback, useMemo } from "react";
import { ExclamationCircleIcon } from "@josemi-icons/react";
import { Button, ButtonVariant } from "folio-react/components/ui/button.tsx";
import { DropdownSelect } from "folio-react/components/form/dropdown-select.tsx";
import { Form } from "folio-react/components/form/index.jsx";
import { FORM_OPTIONS } from "folio-react/constants.js";
import { useClients } from "../contexts/clients.tsx";
import { useSession } from "../contexts/session.tsx";
import type { JSX } from "react";

export const Connection = (): JSX.Element => {
    const clients = useClients();
    const session = useSession();
    const [selectedClientData, setSelectedClientData] = useState({});
    const [selectedClientId, setSelectedClientId] = useState<string>(() => {
        return clients[0].id;
    });

    // build the fields of the selected client
    const selectedClientFields = useMemo(() => {
        const entries = clients.find(entry => entry.id === selectedClientId)?.client?.fields || {};
        const fields = Object.keys(entries);
        return Object.fromEntries(fields.map(field => {
            return [field, {
                type: FORM_OPTIONS.TEXT,
                title: entries[field].label,
                helper: entries[field].description,
                className: "mb-1",
            }];
        }));
    }, [selectedClientId, clients]);

    // generate the formatted list of available clients
    const availableClients = useMemo(() => {
        return clients.map(entry => ({ value: entry.id, text: entry.label }));
    }, [clients]);

    // submit form -> send the credentials object to the session.connect
    const handleSubmit = useCallback(() => {
        session.connect(selectedClientId, selectedClientData);
    }, [selectedClientId, selectedClientData]);

    // disable buttons and input elements when the session status is connecting
    const isDisabled = session.state.status === "connecting";

    return (
        <div className="w-full max-w-sm p-8 rounded-3xl border-1 border-gray-200 bg-white shadow-lg">
            <div className="font-bold text-5xl mb-4 leading-none select-none">
                <span>folio.</span>
            </div>
            {(clients.length > 1 || true) && (
                <div className="w-full mb-4">
                    <div className="text-xs mb-1 font-medium">Select the connection to use:</div>
                    <DropdownSelect
                        value={selectedClientId}
                        values={availableClients}
                        allowToRemove={false}
                        disabled={isDisabled}
                        onChange={(value: string) => {
                            setSelectedClientData({}); // reset credentials
                            setSelectedClientId(value);
                        }}
                    />
                </div>
            )}
            {selectedClientId && Object.keys(selectedClientFields).length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                    <Form
                        key={selectedClientId}
                        items={selectedClientFields}
                        data={selectedClientData}
                        onChange={(key: string, value: string) => {
                            setSelectedClientData(prevData => {
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
                {session.state.error && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-red-500">
                        <div className="flex items-center text-xs leading-none">
                            <ExclamationCircleIcon />
                        </div>
                        <div className="leading-none">{session.state.error.message}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
