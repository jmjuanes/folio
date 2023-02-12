import {create} from "react-test-renderer";
import {Toaster} from "./Toaster.jsx";

const removeToastMock = jest.fn();

jest.mock("@mochicons/react", () => ({
    CloseIcon: () => "CLOSE_ICON",
}));

jest.mock("../../contexts/ToastContext.jsx", () => ({
    useToast: () => ({
        toasts: [
            {id: "toast1", message: "TOAST_1"},
        ],
        removeToast: removeToastMock,
    }),
}));

describe("Toaster", () => {
    it("should render provided toasts", () => {
        const testRenderer = create(<Toaster />);
        const testInstance = testRenderer.root;

        expect(testInstance.findByProps({"data-toast-id", "toast1"})).toBeDefined();
    });

    it("should remove the toast when clicking the close button", () => {
        const testRenderer = create(<Toaster />);
        const testInstance = testRenderer.root;
        
        // Call the onClick fuction of the close button
        testInstance.findByProps({className: "cursor:pointer"}).props.onClick();

        expect(removeToastMock).toHaveBeenCalledWith("toast1");
    });
});
