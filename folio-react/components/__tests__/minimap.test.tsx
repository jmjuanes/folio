import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { render } from "@testing-library/react";

// Mock react-use to avoid ESM export issues
jest.unstable_mockModule("react-use", () => ({
    useMount: () => { },
    useDebounce: () => { },
    useUpdate: () => { },
}));

// Mock Island component to avoid dependencies
jest.unstable_mockModule("../ui/island.tsx", () => ({
    Island: ({ children }: any) => (
        <div data-testid="island">{children}</div>
    ),
}));

const { Minimap } = await import("../minimap.tsx");
const { EditorContext } = await import("../../contexts/editor.tsx");

const mockEditor = {
    width: 1000,
    height: 800,
    getElements: () => [
        { id: "el1", x1: 0, y1: 0, x2: 100, y2: 100, type: "shape" },
        { id: "el2", x1: 2000, y1: 2000, x2: 2100, y2: 2100, type: "shape" },
    ],
    page: {
        id: "page1",
        translateX: 0,
        translateY: 0,
        zoom: 1,
    },
    updatedAt: Date.now(),
};

describe("Minimap", () => {
    const getVisibleRect = (container: HTMLElement) => {
        return container.querySelectorAll("rect")[0];
    };

    it("should render without crashing", () => {
        const { getByTestId } = render(
            <EditorContext.Provider value={[mockEditor, 0]}>
                <Minimap />
            </EditorContext.Provider>
        );
        expect(getByTestId("minimap")).toBeInTheDocument();
    });

    it("should render an SVG with the correct number of elements", () => {
        const { container } = render(
            <EditorContext.Provider value={[mockEditor, 0]}>
                <Minimap />
            </EditorContext.Provider>
        );

        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();

        const rects = container.querySelectorAll("rect");
        expect(rects.length).toBe(3);
    });

    it("should adjust the visible area when the editor is zoomed", () => {
        const zoomedEditor = {
            ...mockEditor,
            page: {
                ...mockEditor.page,
                zoom: 2,
            },
            updatedAt: Date.now() + 100,
        };

        const { container, rerender } = render(
            <EditorContext.Provider value={[mockEditor, 0]}>
                <Minimap />
            </EditorContext.Provider>
        );
        const initialWidth = parseFloat(getVisibleRect(container).getAttribute("width") || "0");

        rerender(
            <EditorContext.Provider value={[zoomedEditor, 0]}>
                <Minimap />
            </EditorContext.Provider>
        );
        const zoomedWidth = parseFloat(getVisibleRect(container).getAttribute("width") || "0");

        expect(zoomedWidth).toBeLessThan(initialWidth);
    });

    it("should shift the visible area when the editor is translated", () => {
        const translatedEditor = {
            ...mockEditor,
            page: { ...mockEditor.page, translateX: -100, translateY: -50 },
            updatedAt: Date.now() + 200,
        };

        const { container, rerender } = render(
            <EditorContext.Provider value={[mockEditor, 0]}>
                <Minimap />
            </EditorContext.Provider>
        );
        const initialX = parseFloat(getVisibleRect(container).getAttribute("x") || "0");
        const initialY = parseFloat(getVisibleRect(container).getAttribute("y") || "0");

        rerender(
            <EditorContext.Provider value={[translatedEditor, 0]}>
                <Minimap />
            </EditorContext.Provider>
        );
        const translatedX = parseFloat(getVisibleRect(container).getAttribute("x") || "0");
        const translatedY = parseFloat(getVisibleRect(container).getAttribute("y") || "0");

        expect(translatedX).toBeGreaterThan(initialX);
        expect(translatedY).toBeGreaterThan(initialY);
    });

    it("should handle empty elements list", () => {
        const emptyEditor = {
            ...mockEditor,
            getElements: () => [],
        };
        const { container } = render(
            <EditorContext.Provider value={[emptyEditor, 0]}>
                <Minimap />
            </EditorContext.Provider>
        );

        // Only the visible area rect should be rendered
        const rects = container.querySelectorAll("rect");
        expect(rects.length).toBe(1);
    });
});
