import { useCallback, useMemo } from "react";
import { loadFromJson, saveAsJson } from "folio-react/lib/json.js";
import { useStorage } from "../contexts/storage.tsx";
import { useNavigate } from "../contexts/router.tsx";

export type App = {
    createDocument: () => void;
    importDocument: () => void;
    openLastEditedDocument: () => void;
};

// hook to manage app
export const useApp = (): App => {
    const storage = useStorage();
    const navigate = useNavigate();

    // create a new document with the provided data
    const createNewDocument = useCallback((data: any) => {
        return storage.createDocument(data).then(newDocumentId => {
            navigate(newDocumentId);
        });
    }, [storage]);

    return useMemo(() => ({
        createDocument: () => {
            return createNewDocument({});
        },
        importDocument: async () => {
            try {
                const documentFromJson = await loadFromJson()
                if (documentFromJson) {
                    createNewDocument(documentFromJson);
                }
            }
            catch (error) {
                console.error(error);
            }
        },
        openLastEditedDocument: () => {
            // 1. check if storage documents are not empty
            if (storage.documents.length > 0 && storage.documents[0]?.id) {
                return navigate(storage.documents[0].id);
            }
            // 2. if not, create a new document and open it
            createNewDocument({});
        },
    }), [storage]);
    // list of available actions
    // const actions = useMemo(() => {
    //     return {
    //         [AppActions.CONFIRMATION]: (value: any) => {
    //             return dispatchConfirmation(value as Confirmation);
    //         },
    //         [AppActions.CREATE_DOCUMENT]: () => {
    //             return createNewDocument({});
    //         },
    //         [AppActions.IMPORT_DOCUMENT]: async () => {
    //             try {
    //                 const documentFromJson = await loadFromJson();
    //                 return createNewDocument(documentFromJson);
    //             }
    //             catch (error) {
    //                 console.error(error);
    //             }
    //         },
    //         [AppActions.DOWNLOAD_DOCUMENT]: async (id: string) => {
    //             // storage.getDocument returns the value of the document
    //             // (it can be a serialized JSON, depending on the client)
    //             const value = await storage?.getDocument(id);
    //             if (value) {
    //                 return saveAsJson(typeof value === "string" ? JSON.parse(value) : value);
    //             }
    //         },
    //         [AppActions.DUPLICATE_DOCUMENT]: async (id: string) => {
    //             const originalDocument = await storage?.getDocument(id);
    //             if (originalDocument) {
    //                 return storage.createDocument({
    //                     ...originalDocument,
    //                     title: `Copy of ${originalDocument.title || "Untitled"}`,
    //                 });
    //             }
    //         },
    //         [AppActions.DELETE_DOCUMENT]: async (id: string) => {
    //             try {
    //                 // the name is in the metadata of the list, getDocument only returns the value
    //                 const documentName = storage.documents.find(entry => entry.id === id)?.metadata?.name || "Untitled";
    //                 await dispatchConfirmation({
    //                     title: "Delete document",
    //                     message: `Do you want to delete the document '${documentName}'?`,
    //                 });
    //                 await storage?.deleteDocument(id);
    //             }
    //             catch (error) {
    //                 console.error(error);
    //             }
    //         },
    //         [AppActions.OPEN_LAST_EDITED_DOCUMENT]: async () => {
    //             return openLastEditedDocument();
    //         },
    //     };
    // }, [storage, dispatchConfirmation, createNewDocument, openLastEditedDocument]);
};
