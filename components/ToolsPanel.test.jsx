import {render, screen} from "@testing-library/react";
import {ToolsPanel} from "./ToolsPanel.jsx";

jest.mock("@josemi-icons/react", () => ({
    CircleIcon: jest.fn(() => "CIRCLE_ICON"),
    EraseIcon: jest.fn(() => "ERASE_ICON"),
    HandGrabIcon: jest.fn(() => "HAND_GRAB_ICON"),
    ImageIcon: jest.fn(() => "IMAGE_ICON"),
    LockIcon: jest.fn(() => "LOCK_ICON"),
    NoteIcon: jest.fn(() => "NOTE_ICON"),
    PenIcon: jest.fn(() => "PEN_ICON"),
    PointerIcon: jest.fn(() => "POINTER_ICON"),
    SquareIcon: jest.fn(() => "SQUARE_ICON"),
    TextIcon: jest.fn(() => "TEXT_ICON"),
    ToolsIcon: jest.fn(() => "TOOLS_ICON"),
    TriangleIcon: jest.fn(() => "TRIANGLE_ICON"),
    UnlockIcon: jest.fn(() => "UNLOCK_ICON"),
}));

jest.mock("../contexts/BoardContext.jsx", () => ({
    useBoard: jest.fn(() => ({
        defaults: {},
        activeTool: "shape",
        activeAction: "",
    })),
}));

jest.mock("../hooks/index.js", () => ({
    useForceUpdate: jest.fn(() => ([null, jest.fn()])),
}));

describe("ToolsPanel", () => {
    it("should render", () => {
        render(
            <ToolsPanel />
        );

        expect(screen.getByTestId("toolspanel")).toBeDefined();
    });
});
