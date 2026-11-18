import { jest } from "@jest/globals";

// Import the ToolState from the tool.ts file
// Based on jest.config.js, babel-jest should handle the transformation
const { ToolState } = await import("../tool.ts");

describe("ToolState", () => {
    it("should handle nested transitions correctly", () => {
        const events = [];
        
        class StateA extends ToolState {
            onEnter() {
                events.push("a:enter");
                // Immediately transition to state B
                this.parent.transition("b");
            }
            onExit() {
                events.push("a:exit");
            }
        }

        class StateB extends ToolState {
            onEnter() {
                events.push("b:enter");
            }
            onExit() {
                events.push("b:exit");
            }
        }

        class Root extends ToolState {
            children = {
                "a": StateA,
                "b": StateB,
            };
        }

        const editor = {};
        const root = new Root(editor);
        root.id = "root";
        
        // Initial state is null/empty
        root.transition("a");
        
        // After transition("a"), which triggers transition("b"),
        // the active state should be "b"
        expect(root.activeStateId).toBe("b");
        expect(events).toEqual(["a:enter", "a:exit", "b:enter"]);
    });
});
