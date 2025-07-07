import { jest } from "@jest/globals";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

jest.unstable_mockModule("@josemi-icons/react", () => ({
    CheckIcon: () => null,
    renderIcon: icon => icon.toUpperCase(),
}));

import { Dropdown } from "../dropdown.jsx";

describe("<Dropdown />", () => {
    it("should render", () => {
        render(
            <Dropdown>
                <Dropdown.Item>Action 1</Dropdown.Item>
                <Dropdown.Item>Action 2</Dropdown.Item>
                <Dropdown.Separator />
                <Dropdown.Item>Action 3</Dropdown.Item>
            </Dropdown>
        );

        expect(screen.getByTestId("dropdown")).toBeInTheDocument();
        expect(screen.getByTestId("dropdown-separator")).toBeInTheDocument();

        expect(screen.getByText("Action 1")).toBeInTheDocument();
        expect(screen.getByText("Action 2")).toBeInTheDocument();
        expect(screen.getByText("Action 3")).toBeInTheDocument();
    });

    it("should handle click events", async () => {
        const user = userEvent.setup();
        const handleClick = jest.fn();

        render(
            <Dropdown>
                <Dropdown.Item onClick={handleClick}>Click me</Dropdown.Item>
            </Dropdown>
        );
        
        await user.click(screen.getByText("Click me"));

        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
