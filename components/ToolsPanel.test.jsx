import {render, screen} from "@testing-library/react";
import {ToolsPanel} from "./ToolsPanel.jsx";

jest.mock("../contexts/BoardContext.jsx", () => ({
    useBoard: jest.fn(() => ({
        defaults: {},
        activeTool: "shape",
        activeAction: "",
    })),
}));

jest.mock("../hooks/useForceUpdate.js", () => ({
    useForceUpdate: jest.fn(() => jest.fn()),
}));

describe("ToolsPanel", () => {
    it("should render", () => {
        render(
            <ToolsPanel />
        );

        expect(screen.getByTestId("toolspanel")).toBeDefined();
    });
});
