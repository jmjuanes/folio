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
    private sessions: PointerSession[];

    constructor(editor: any) {
        this.editor = editor;
        this.sessions = [];
    }

    // @description get all pointer sessions
    getSessions(): PointerSession[] {
        return this.sessions || [];
    }

    // @description get a pointer session by id
    getSession(sessionId: string): PointerSession | undefined {
        return this.sessions.find((session: PointerSession) => session.id === sessionId);
    }

    // @description clear all sessions
    clearSessions() {
        this.sessions.forEach((session: PointerSession) => {
            clearInterval(session.timer);
        });
        this.sessions = [];
    }

    // @description start a new pointer effect
    startSession(options: PointerSessionOptions): string {
        const sessionId = uid(20);
        this.sessions.push({
            id: sessionId,
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
        this.startTimer(sessionId);
        return sessionId;
    }

    // @description Add a point to an existing pointer effect
    addPoint(sessionId: string, x: number, y: number) {
        const pointer = this.getSession(sessionId);
        if (pointer && !pointer.finished) {
            pointer.points.push({ x, y, time: Date.now() });
            pointer.lastUpdate = Date.now();
            this.editor.update();
        }
    }

    // @description Mark a pointer effect as finished
    finishSession(sessionId: string) {
        const pointer = this.getSession(sessionId);
        if (pointer) {
            pointer.finished = true;
            this.editor.update();
        }
    }

    // @description Remove a pointer effect
    removeSession(sessionId: string) {
        this.stopTimer(sessionId); // stop the timer before removing the pointer session
        this.sessions = this.sessions.filter((session: PointerSession) => session.id !== sessionId);
        this.editor.update();
    }

    // @description Timer to handle fading/removal of points
    private startTimer(sessionId: string) {
        const pointer = this.getSession(sessionId);
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
                    return this.removeSession(pointer.id);
                }

                // check if we have to perform an update
                if (pointer.points.length !== initialPointsCount) {
                    this.editor.update();
                }
            }, pointer.fadeDuration);
        }
    }

    private stopTimer(sessionId: string) {
        const pointer = this.getSession(sessionId);
        if (pointer && pointer?.timer) {
            clearInterval(pointer.timer);
            pointer.timer = null;
        }
    }
};
