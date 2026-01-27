export type Page = {
    id: string;
    title?: string;
    description?: string;
    elements?: any[];
    history?: any[];
    historyIndex?: number;
    translateX?: number;
    translateY?: number;
    zoom?: number;
    readonly?: boolean;
};
