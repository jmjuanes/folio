import {fireEvent, render, screen, act, waitFor} from "@testing-library/react";
import {ExportDialog} from "./ExportDialog.jsx";

jest.mock("../contexts/BoardContext.jsx", () => ({
    useBoard: jest.fn(() => ({
        elements: [],
    })),
}));
jest.mock("../export.js", () => ({
    exportToDataURL: jest.fn(() => Promise.resolve("DATA_URL")),
    exportToFile: jest.fn(),
    exportToClipboard: jest.fn(),
}));
jest.mock("../assets/transparent.svg", () => "TRANSPARENT_BG");
jest.mock("./Modal.jsx", () => ({
    Modal: props => props.children,
}));
// Mock the button component to make it simple
jest.mock("./Button.jsx", () => ({
    SecondaryButton: props => (
        <div data-testid={props.testid} onClick={props.onClick}>
            {props.text}
        </div>
    ),
}));

describe("ExportDialog", () => {
    it("should render", async () => {
        render(<ExportDialog />);
        // Hack to prevent 'act' warning
        // https://davidwcai.medium.com/react-testing-library-and-the-not-wrapped-in-act-errors-491a5629193b
        await waitFor(() => {
            return expect(screen.getByTestId("export-preview")).toBeDefined();
        });
    });

    it("should close export dialog when clicking on X icon", async () => {
        const onClose = jest.fn();
        render(<ExportDialog onClose={onClose} />);
        await waitFor(() => {
            return expect(screen.getByTestId("export-close")).toBeDefined();
        });
        // Fire click on close button
        act(() => {
            fireEvent.click(screen.getByTestId("export-close"));
        });
        // Expect 'onClose'  to have been called
        expect(onClose).toHaveBeenCalled();
    });

    it("should render preview image", async () => {
        render(<ExportDialog />);
        expect(screen.getByText("Generating preview...")).toBeDefined();

        // After preview is generated, it should be displayed in the preview section
        await waitFor(() => {
            return expect(screen.getByTestId("export-preview-image").getAttribute("src")).toEqual("DATA_URL");
        });
    });

    it("should change text in clipboard button when clicked", async () => {
        render(<ExportDialog />);
        await waitFor(() => {
            expect(screen.getByTestId("export-btn-clipboard")).toBeDefined();
            expect(screen.getByTestId("export-btn-clipboard").textContent).toEqual("Copy to clipboard");
        });
        // Fire click event in copy to clipboard button
        act(() => {
            fireEvent.click(screen.getByTestId("export-btn-clipboard"));
        });
        await waitFor(() => {
            return expect(screen.getByTestId("export-btn-clipboard").textContent).toEqual("Copied!");
        });
    });

    it("should reset text in clipboard button after the specified delay", async () => {
        render(<ExportDialog copiedToClipboardMessageDelay={500} />);
        await waitFor(() => {
            expect(screen.getByTestId("export-btn-clipboard")).toBeDefined();
            expect(screen.getByTestId("export-btn-clipboard").textContent).toEqual("Copy to clipboard");
        });
        // Fire click event in copy to clipboard button
        act(() => {
            fireEvent.click(screen.getByTestId("export-btn-clipboard"));
        });
        await waitFor(() => {
            return expect(screen.getByTestId("export-btn-clipboard").textContent).toEqual("Copied!");
        });
        await waitFor(() => {
            return expect(screen.getByTestId("export-btn-clipboard").textContent).toEqual("Copy to clipboard");
        });
    });
});
