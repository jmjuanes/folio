import React from "react";
import { TOOLS } from "../constants.js";
import type { Tool } from "../types.ts";

export const HandTool = {
    id: TOOLS.DRAG,
    state: {
        lastTranslateX: 0,
        lastTranslateY: 0,
    },
    onEnter: (editor: any, self: Tool) => {
        // self.state.lastTranslateX = 0;
        // self.state.lastTranslateY = 0;
    },
    onPointerDown: (editor: any, self: Tool, event: any) => {
        self.state.lastTranslateX = editor.page.translateX;
        self.state.lastTranslateY = editor.page.translateY;
    },
    onPointerMove: (editor: any, self: Tool, event: any) => {
        editor.page.translateX = Math.floor(self.state.lastTranslateX + event.dx * editor.page.zoom);
        editor.page.translateY = Math.floor(self.state.lastTranslateY + event.dy * editor.page.zoom);
    },
    onPointerUp: (editor: any, self: Tool, event: any) => {
        self.state.lastTranslateX = editor.page.translateX;
        self.state.lastTranslateY = editor.page.translateY;
    },
} as Tool;
