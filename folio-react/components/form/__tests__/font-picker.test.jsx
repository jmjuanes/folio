import { expect, it, jest } from "@jest/globals";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { FontPicker } from "../font-picker.jsx";

describe("<FontPicker />", () => {
    const fonts = ["Arial", "Courier New", "Georgia", "Verdana"];
    it("should render", () => {
        render(<FontPicker />);
        expect(screen.getByTestId("fontpicker")).toBeInTheDocument();
    });

    it("should render font values", () => {
        render(<FontPicker values={fonts} />);
        screen.getAllByTestId("fontpicker-item").forEach((element, index) => {
            expect(element).toHaveStyle({
                fontFamily: fonts[index],
            });
        });
    });

    it("should mark the provided font as active", () => {
        const index = 1;

        render(<FontPicker value={fonts[index]} values={fonts} />);
        expect(screen.getAllByTestId("fontpicker-item")[1]).toHaveClass("active");
    });

    it("should emit the 'onChange' event when clicking on a font", async () => {
        const handleChange = jest.fn();
        const index = 1;
        const user = userEvent.setup();
        render(<FontPicker values={fonts} onChange={handleChange} />);

        await user.click(screen.getAllByTestId("fontpicker-item")[index]);

        expect(handleChange).toHaveBeenCalledWith(fonts[index]);
    });
});
