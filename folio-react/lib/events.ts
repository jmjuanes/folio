// internal point event used
export type EditorPointEvent = {
    originalX: number;
    originalY: number;
    currentX?: number; // on move
    currentY?: number; // on move
    dx?: number;       // on move
    dy?: number;       // on move
    shiftKey: boolean;
    nativeEvent?: PointerEvent;
    drag?: boolean;    // true on move
};

export type EditorKeyboardEvent = {
    key: string;
    shiftKey: boolean;
    ctrlKey: boolean;
    nativeEvent: KeyboardEvent;
};
