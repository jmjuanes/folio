import {fireEvent, render, screen, act, waitFor} from "@testing-library/react";
import {ExportDialog} from "./ExportDialog.jsx";

jest.mock("../contexts/BoardContext.jsx", () => ({
    useBoard: jest.fn(() => ({
        elements: [],
    })),
}));

jest.mock("../board/export.js", () => ({
    exportToDataURL: jest.fn(() => Promise.resolve("DATA_URL")),
    exportToFile: jest.fn(),
    exportToClipboard: jest.fn(),
}));

jest.mock("../assets/transparent.svg", () => "TRANSPARENT_BG");

jest.mock("@josemi-ui/components", () => ({
    Button: ({children, ...props}) => (
        <div {...props}>{children}</div>
    ),
    Overlay: () => null,
    Modal: props => props.children,
    ModalHeader: () => null,
    ModalTitle: jest.fn(),
    ModalClose: jest.fn(),
    ModalBody: props => props.children,
}));

jest.mock("@josemi-icons/react", () => ({
    ImageIcon: jest.fn(() => "IMAGE_ICON"),
    DownloadIcon: jest.fn(() => "DOWNLOAD_ICON"),
    ClipboardIcon: jest.fn(() => "CLIPBOARD_ICON"),
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
            expect(screen.getByTestId("export-btn-clipboard").textContent).toContain("Copy to clipboard");
        });
        // Fire click event in copy to clipboard button
        act(() => {
            fireEvent.click(screen.getByTestId("export-btn-clipboard"));
        });
        await waitFor(() => {
            return expect(screen.getByTestId("export-btn-clipboard").textContent).toContain("Copied!");
        });
    });

    it("should reset text in clipboard button after the specified delay", async () => {
        render(<ExportDialog copiedToClipboardMessageDelay={500} />);
        await waitFor(() => {
            expect(screen.getByTestId("export-btn-clipboard")).toBeDefined();
            expect(screen.getByTestId("export-btn-clipboard").textContent).toContain("Copy to clipboard");
        });
        // Fire click event in copy to clipboard button
        act(() => {
            fireEvent.click(screen.getByTestId("export-btn-clipboard"));
        });
        await waitFor(() => {
            return expect(screen.getByTestId("export-btn-clipboard").textContent).toContain("Copied!");
        });
        await waitFor(() => {
            return expect(screen.getByTestId("export-btn-clipboard").textContent).toContain("Copy to clipboard");
        });
    });
});
