import { Preferences } from "folio-react/contexts/preferences";

export type Store = {
    initialize: () => Promise<void>;
    getInitialData: () => Promise<any>;
    updateData: (data: any) => Promise<void>;
    getInitialLibrary: () => Promise<any>;
    updateLibrary: (library: any) => Promise<void>;
    getInitialPreferences: () => Promise<Partial<Preferences>>;
    updatePreferences: (preferences: Partial<Preferences>) => Promise<any>;
};
