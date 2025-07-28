export type Store = {
    initialize: () => Promise<void>;
    getInitialData: () => Promise<any>;
    updateData: (data: any) => Promise<void>;
    getInitialLibrary: () => Promise<any>;
    updateLibrary: (library: any) => Promise<void>;
};
