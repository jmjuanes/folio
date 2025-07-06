import { expect, jest } from "@jest/globals";
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

    it("should display color provided as value", () => {
        const color = "#ff0000";
        render(<ColorPicker value={color} />);
        expect(screen.getByTestId("colorpicker-preview")).toHaveStyle({
            backgroundColor: color,
        });
        expect(screen.getByTestId("colorpicker-input")).toHaveValue(color);
    });

    it("should display color values", () => {
        render(<ColorPicker values={colors} />);
        screen.getAllByTestId("colorpicker-value").forEach((element, index) => {
            expect(element).toHaveStyle({
                backgroundColor: colors[index],
            });
        });
    });

    it("should change input value when clicking on a color value of the palette", async () => {
        const user = userEvent.setup();
        render(<ColorPicker values={colors} />);

        await user.click(screen.getAllByTestId("colorpicker-value")[0]);

        expect(screen.getByTestId("colorpicker-input")).toHaveValue(colors[0]);
    });

    it("should emit 'onChange' when clicking on an color value of the palette", async () => {
        const handleChange = jest.fn();
        const colorIndex = 1;
        const user = userEvent.setup();
        render(<ColorPicker values={colors} onChange={handleChange} />);

        await user.click(screen.getAllByTestId("colorpicker-value")[colorIndex]);

        expect(handleChange).toHaveBeenCalledWith(colors[colorIndex]);
    });

    it("should emit 'onChange' when typing a color value in the input", async () => {
        const handleChange = jest.fn();
        const user = userEvent.setup();
        render(<ColorPicker onChange={handleChange} />);

        await user.type(screen.getByTestId("colorpicker-input"), colors[0]);

        expect(handleChange).toHaveBeenCalledWith(colors[0]);
    });
});
