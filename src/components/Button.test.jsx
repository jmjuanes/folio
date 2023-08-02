import {fireEvent, render, screen, act} from "@testing-library/react";
import {Button} from "./Button.jsx";

describe("Button", () => {
    it("should render", () => {
        render(<Button />);
        expect(screen.getByTestId("btn")).toBeDefined();
    });

    it("should render button text if provided", () => {
        render(<Button text="BTN_TEXT" />);
        expect(screen.getByTestId("btn-text").textContent).toEqual("BTN_TEXT");
    });

    it("should render button icon if provided", () => {
        render(<Button icon="BTN_ICON" />);
        expect(screen.getByTestId("btn-icon").textContent).toEqual("BTN_ICON");
    });

    it("should do not render button text container if no text is provided", () => {
        render(<Button />);
        expect(screen.queryByTestId("btn-text")).toBeNull();
    });

    it("should execute the provided function on click", () => {
        const handleClick = jest.fn();

        render(<Button onClick={handleClick} />);
        act(() => {
            fireEvent.click(screen.getByTestId("btn"));
        });
        expect(handleClick).toHaveBeenCalled();
    });
});
