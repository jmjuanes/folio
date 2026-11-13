import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { loadFromJson, saveAsJson } from "folio-react/lib/json.js";
import { useStorage } from "./storage.tsx";
import { useNavigate } from "./router.tsx";
import type { JSX, PropsWithChildren } from "react";

export enum AppActions {
    CONFIRMATION = "confirmation",
    CREATE_DOCUMENT = "document:create",
    IMPORT_DOCUMENT = "document:import",
    DUPLICATE_DOCUMENT = "document:duplicate",
    DOWNLOAD_DOCUMENT = "document:download",
    DELETE_DOCUMENT = "document:delete",
    OPEN_LAST_EDITED_DOCUMENT = "document:open_last_edited",
};

export type AppDispatcher = (action: AppActions, value?: any) => Promise<any>;

// internal confirmation
type Confirmation = {
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
};

// main app context
export const AppContext = createContext({});

// hook to manage app
export const useApp = (): AppDispatcher => {
    const actions = useContext(AppContext) as Record<string, any>;
    return useCallback(async (action: AppActions, value?: any): Promise<any> => {
        const listener = actions?.[action];
        if (typeof listener === "function") {
            return listener(value);
        }
    }, [actions]);
};

export const AppProvider = (props: PropsWithChildren): JSX.Element => {
    const [confirmationDialog, setConfirmationDialog] = useState<Confirmation | null>(null);
    const storage = useStorage();
    const navigate = useNavigate();

    // dispatch a confirmation message
    const dispatchConfirmation = useCallback((value: Confirmation) => {
        return new Promise((resolve, reject) => {
            setConfirmationDialog({
                title: value.title,
                message: value.message,
                onConfirm: () => {
                    setConfirmationDialog(null);
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmationDialog(null);
                    reject();
                },
            });
        });
    }, [setConfirmationDialog]);

    // create a new document with the provided data
    const createNewDocument = useCallback((data: any) => {
        return storage.createDocument(data).then(newDocumentId => {
            navigate(newDocumentId);
        });
    }, [storage]);

    // callback to display the last edited document
    const openLastEditedDocument = useCallback(async () => {
        // 1. check if storage documents are not empty
        if (storage.documents.length > 0 && storage.documents[0]?.id) {
            return navigate(storage.documents[0].id);
        }
        // 2. if not, create a new document and open it
        return createNewDocument({});
    }, [storage, createNewDocument]);

    // list of available actions
    const actions = useMemo(() => {
        return {
            [AppActions.CONFIRMATION]: (value: any) => {
                return dispatchConfirmation(value as Confirmation);
            },
            [AppActions.CREATE_DOCUMENT]: () => {
                return createNewDocument({});
            },
            [AppActions.IMPORT_DOCUMENT]: async () => {
                try {
                    const documentFromJson = await loadFromJson();
                    return createNewDocument(documentFromJson);
                }
                catch (error) {
                    console.error(error);
                }
            },
            [AppActions.DOWNLOAD_DOCUMENT]: async (id: string) => {
                const response = await storage?.getDocument(id);
                if (response?.value) {
                    return saveAsJson(JSON.parse(response.value as any));
                }
            },
            [AppActions.DUPLICATE_DOCUMENT]: async (id: string) => {
                const originalDocument = await storage?.getDocument(id);
                if (originalDocument) {
                    return storage.createDocument({
                        ...originalDocument,
                        title: `Copy of ${originalDocument.title || "Untitled"}`,
                    });
                }
            },
            [AppActions.DELETE_DOCUMENT]: async (id: string) => {
                try {
                    const response = await storage?.getDocument(id);
                    await dispatchConfirmation({
                        title: "Delete document",
                        message: `Do you want to delete the document '${response.metadata.name}'?`,
                    });
                    await storage?.deleteDocument(id);
                }
                catch (error) {
                    console.error(error);
                }
            },
            [AppActions.OPEN_LAST_EDITED_DOCUMENT]: async () => {
                return openLastEditedDocument();
            },
        };
    }, [storage, dispatchConfirmation, createNewDocument, openLastEditedDocument]);

    return (
        <AppContext.Provider value={actions}>
            {props.children}
        </AppContext.Provider>
    );
};
