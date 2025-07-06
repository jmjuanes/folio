import { jest } from "@jest/globals";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { ColorPicker } from "../color-picker.jsx";

describe("<ColorPicker />", () => {
    const colors = ["#fff", "#000", "#eaea"]

    it("should render", () => {
        render(<ColorPicker />);
        expect(screen.getByTestId("colorpicker")).toBeInTheDocument();
    });

    it("should display color values", () => {
        render(<ColorPicker values={colors} />);
        screen.getAllByTestId("colorpicker-value").forEach((element, index) => {
            expect(element).toHaveStyle({
                backgroundColor: colors[index],
            });
        });
    });

    it("should emit 'onChange' when clicking on an color value of the palette", () => {
        const handleChange = jest.fn();
        const colorIndex = 1;
        const user = userEvent.setup();
        render(<ColorPicker values={colors} onChange={handleChange} />);

        user.click(screen.getAllByTestId("colorpicker-value")[colorIndex]);
        expect(handleChange).toHaveBeenCalledWith(colors[colorIndex]);
    });
});
