import {create} from "react-test-renderer";
import {Toaster} from "./Toaster.jsx";

jest.mock("@mochicons/react", () => ({
    CloseIcon: () => "CLOSE_ICON",
}));

jest.mock("../../contexts/ToastContext.jsx", () => ({
    useToast: () => ({
        toasts: [
            {id: "toast1", message: "TOAST_1"},
            {id: "toast2", message: "TOAST_2"},
        ],
        removeToast: jest.fn(),
    }),
}));

describe("Toaster", () => {
    it("should render provided toasts", () => {
        const testRenderer = create(<Toaster />);
        const testInstance = testRenderer.root;

        expect(testInstance.findByProps({"data-toast-id": "toast1"})).toBeDefined();
        expect(testInstance.findByProps({"data-toast-id": "toast2"})).toBeDefined();
    });
});
