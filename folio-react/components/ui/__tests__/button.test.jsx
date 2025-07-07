import { jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button } from "../button.jsx";

describe("<Button />", () => {
    it("should render", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole("button")).toHaveTextContent("Click me");
    });

    it("should dispatch click events", () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByRole("button"));

        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
