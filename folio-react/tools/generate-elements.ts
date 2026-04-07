import { TOOLS } from "../constants.js";
import { ToolState } from "../lib/tool.ts";

export class GenerateElementsTool extends ToolState {
    id = TOOLS.GENERATE_ELEMENTS;
    private submitted: boolean = false;

    onEnter() {
        this.submitted = false;
    }

    onExit() {
        this.submitted = false;
    }



};
