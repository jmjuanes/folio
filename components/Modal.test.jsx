import {fireEvent, render, screen, act, waitFor} from "@testing-library/react";
import {Modal} from "./Modal.jsx";

jest.mock("@josemi-icons/react", () => ({
    CloseIcon: jest.fn(() => "CLOSE_ICON"),
}));

describe("Modal", () => {
    it("should render", async () => {
        render(<Modal />);
        await waitFor(() => {
            return expect(screen.getByTestId("modal")).toBeDefined();
        });
    });

    it("should render the title", async () => {
        const title = "MODAL_TITLE";
        render(<Modal title={title} />);
        await waitFor(() => {
            return expect(screen.getByTestId("modal-title").textContent).toEqual(title);
        });
    });

    it("should execute the provided function when clicking the close button", async () => {
        const onClose = jest.fn();
        render(<Modal onClose={onClose} />);
        await waitFor(() => {
            return expect(screen.getByTestId("modal")).toBeDefined();
        });
        act(() => {
            fireEvent.click(screen.getByTestId("modal-close"));
        });
        expect(onClose).toHaveBeenCalled();
    });

    it("should render the provided content", async () => {
        const content = "MODAL_CONTENT";
        render(<Modal>{content}</Modal>);
        await waitFor(() => {
            return expect(screen.getByTestId("modal")).toBeDefined();
        });
        expect(screen.getByTestId("modal-content").textContent).toEqual(content);
    });
});
