import {create} from "react-test-renderer";
import {Modal} from "./Modal.jsx";

describe("Modal", () => {
    it("should render", () => {
        const testRenderer = create(<Modal>Content</Modal>);

        expect(testRenderer.toJSON()).toMatchSnapshot();
    });

    it("should display the close icon if onClose function is provided", () => {
        const mockFn = jest.fn();
        const testRenderer = create(<Modal onClose={mockFn}>Content</Modal>);
        const testInstance = testRenderer.root;

        // expect(testInstance.findByType(CloseIcon)).toBeDefined();
        expect(testInstance.findByProps({onClick: mockFn})).toBeDefined();
    });
});
