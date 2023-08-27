import {render, screen} from "@testing-library/react";
import {ToolsPanel} from "./ToolsPanel.jsx";

jest.mock("@josemi-icons/react", () => ({
    NoteIcon: jest.fn(() => "NOTE_ICON"),
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
