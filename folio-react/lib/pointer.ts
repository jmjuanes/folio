import { uid } from "uid/secure";

const DEFAULT_OPACITY = 1;
const DEFAULT_FADE_DELAY = 50;
const DEFAULT_FADE_DURATION = 50;

export type PointerSessionOptions = {
    color: string;
    size: number;
    opacity?: number;
    fadeDuration?: number;
    fadeDelay?: number;
};

export type PointerPoint = {
    x: number;
    y: number;
    time: number;
};

export type PointerSession = {
    id: string;
    points: PointerPoint[];
    color: string;
    size: number;
    opacity: number;
    finished: boolean;
    lastUpdate: number;
    fadeDuration: number;
    fadeDelay: number;
    timer: any;
};

export class PointerManager {
    private editor: any;
    private pointers: PointerSession[];

    constructor(editor: any) {
        this.editor = editor;
        this.pointers = [];
    }

    // @description get all pointer sessions
    getSessions(): PointerSession[] {
        return this.pointers || [];
    }

    // @description get a pointer session by id
    getSession(pointerId: string): PointerSession | undefined {
        return this.pointers.find((p: PointerSession) => p.id === pointerId);
    }

    // @description start a new pointer effect
    start(options: PointerSessionOptions): string {
        const pointerId = uid(20);
        this.pointers.push({
            id: pointerId,
            points: [],
            color: options.color,
            size: options.size,
            opacity: options.opacity ?? DEFAULT_OPACITY,
            finished: false,
            lastUpdate: Date.now(),
            fadeDuration: options.fadeDuration ?? DEFAULT_FADE_DURATION,
            fadeDelay: options.fadeDelay ?? DEFAULT_FADE_DELAY,
            timer: null,
        });
        this.startTimer(pointerId);
        return pointerId;
    }

    // @description Add a point to an existing pointer effect
    addPoint(pointerId: string, x: number, y: number) {
        const pointer = this.getSession(pointerId);
        if (pointer && !pointer.finished) {
            pointer.points.push({ x, y, time: Date.now() });
            pointer.lastUpdate = Date.now();
            this.editor.update();
        }
    }

    // @description Mark a pointer effect as finished
    finish(pointerId: string) {
        const pointer = this.getSession(pointerId);
        if (pointer) {
            pointer.finished = true;
            this.editor.update();
        }
    }

    // @description Remove a pointer effect
    remove(pointerId: string) {
        this.stopTimer(pointerId); // stop the timer before removing the pointer session
        this.pointers = this.pointers.filter((p: any) => p.id !== pointerId);
        this.editor.update();
    }

    // @description Timer to handle fading/removal of points
    startTimer(pointerId: string) {
        const pointer = this.getSession(pointerId);
        if (pointer && !pointer.timer) {
            pointer.timer = setInterval(() => {
                const now = Date.now();
                const threshold = now - pointer.fadeDelay;
                const initialPointsCount = pointer.points.length;

                // Filter out old points
                pointer.points = pointer.points.filter((point: PointerPoint) => {
                    return point.time >= threshold;
                });

                // if finished and no points left, we can remove it
                if (pointer.finished && pointer.points.length === 0) {
                    return this.remove(pointer.id);
                }

                // check if we have to perform an update
                if (pointer.points.length !== initialPointsCount) {
                    this.editor.update();
                }
            }, pointer.fadeDuration);
        }
    }

    stopTimer(pointerId: string) {
        const pointer = this.getSession(pointerId);
        if (pointer && pointer?.timer) {
            clearInterval(pointer.timer);
            pointer.timer = null;
        }
    }
};
