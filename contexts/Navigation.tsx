import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStorage } from "./Storage.tsx";
import type { JSX, PropsWithChildren } from "react";
import type { StorageDocument } from "../lib/clients/types.ts";

export enum Dialogs {
    LOGIN = "login",
    WELCOME = "welcome",
    SETTINGS = "settings",
};

// navigation state type
export type NavigationState = {
    activeBoard: string | null;
    activeDialog: Dialogs | null;
    openBoard: (id: string) => void;
    openDialog: (dialog: Dialogs) => void;
    closeDialog: () => void;
};

const NavigationContext = createContext<NavigationState>({} as NavigationState);

// @description hook to use the navigation
export const useNavigation = (): NavigationState => {
    return useContext(NavigationContext);
};

// internal method to get the last edited document
const getLastEdited = (documents: StorageDocument[]): StorageDocument | null => {
    return documents.reduce<StorageDocument | null>((last, item) => {
        const isNewer = (item.metadata?.updated_at || 0) > (last?.metadata?.updated_at || 0);
        return !last || isNewer ? item : last;
    }, null);
};

// @description navigation provider
// This provider is remounted every time the storage changes (see StorageProvider),
// so the initial state is all we need to apply the startup and login rules:
// - no storage available: login dialog (the app displays a fake board)
// - storage available (on startup or after login): welcome dialog
export const NavigationProvider = (props: PropsWithChildren): JSX.Element => {
    const storage = useStorage();
    const creatingBoard = useRef(false);
    const [activeBoard, setActiveBoard] = useState<string | null>(null);
    const [activeDialog, setActiveDialog] = useState<Dialogs | null>(() => {
        return storage.type ? Dialogs.WELCOME : Dialogs.LOGIN;
    });

    // Rule: there must always be an active board when a storage is available
    // (except while the welcome dialog is displayed, where the user chooses one).
    // This covers closing the welcome dialog and deleting the active board:
    // open the last edited board or, if there are none, create a new one.
    useEffect(() => {
        const needsBoard = !!storage.type
            && activeDialog !== Dialogs.WELCOME
            && !storage.documents.some((item: StorageDocument) => item.id === activeBoard);
        if (needsBoard && !creatingBoard.current) {
            const lastEdited = getLastEdited(storage.documents);
            if (lastEdited) {
                setActiveBoard(lastEdited.id);
            }
            else {
                creatingBoard.current = true;
                storage.createDocument()
                    .then(({ id }) => setActiveBoard(id))
                    .catch((error: any) => console.error(error))
                    .finally(() => {
                        creatingBoard.current = false;
                    });
            }
        }
    }, [storage, activeBoard, activeDialog]);

    const openBoard = useCallback((id: string) => {
        setActiveBoard(id);
        setActiveDialog(null);
    }, []);

    const closeDialog = useCallback(() => {
        setActiveDialog(null);
    }, []);

    const navigation = useMemo<NavigationState>(() => {
        return {
            activeBoard: activeBoard,
            activeDialog: activeDialog,
            openBoard: openBoard,
            openDialog: setActiveDialog,
            closeDialog: closeDialog,
        };
    }, [activeBoard, activeDialog, openBoard, closeDialog]);

    return (
        <NavigationContext value={navigation}>
            {props.children}
        </NavigationContext>
    );
};
