import TestRenderer from "react-test-renderer";
import {Dropdown, DropdownItem} from "./Dropdown.jsx";

describe("Dropdown", () => {
    it("should render the provided items", () => {
        const items = [
            {text: "Item 1"},
            {text: "Item 2"},
        ];
        const testRenderer = TestRenderer.create(<Dropdown items={items} />);
        const testInstance = testRenderer.root;
        const childItems = testInstance.findAllByType(DropdownItem);

        expect(childItems[0].props.text).toEqual("Item 1");
        expect(childItems[1].props.text).toEqual("Item 2");
    });

    it("should call the provided onClick listener", () => {
        const mockFn = jest.fn();
        const items = [
            {text: "Item 1", onClick: mockFn},
        ];
        const testRenderer = TestRenderer.create(<Dropdown items={items} />);

        // Run the onClick method
        testRenderer.root.findByType(DropdownItem).props.onClick();

        expect(mockFn).toHaveBeenCalled();
    });
});
