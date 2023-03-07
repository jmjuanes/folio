import {create} from "react-test-renderer";
import {Dropdown, DropdownItem} from "./Dropdown.jsx";

jest.mock("@mochicons/react", () => ({
    CheckIcon: () => null,
}));

describe("Dropdown", () => {
    it("should render", () => {
        const testRenderer = create((
            <Dropdown>
                <DropdownItem text="Item 1" />
                <DropdownItem text="Item 2" />
            </Dropdown>
        ));

        expect(testRenderer.toJSON()).toMatchSnapshot();
    });

    it("should render the provided items", () => {
        const testRenderer = create((
            <Dropdown>
                <DropdownItem text="Item 1" />
                <DropdownItem text="Item 2" />
            </Dropdown>
        ));
        const testInstance = testRenderer.root;
        const childItems = testInstance.findAllByType(DropdownItem);

        expect(childItems[0].props.text).toEqual("Item 1");
        expect(childItems[1].props.text).toEqual("Item 2");
    });

    it("should call the provided onClick listener", () => {
        const mockFn = jest.fn();
        const testRenderer = create((
            <Dropdown>
                <DropdownItem text="Item 1" onClick={mockFn} />
            </Dropdown>
        ));

        // Run the onClick method
        testRenderer.root.findByType(DropdownItem).props.onClick();

        expect(mockFn).toHaveBeenCalled();
    });
});
