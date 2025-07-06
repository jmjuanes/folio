import { jest } from "@jest/globals";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { ColorPicker } from "../color-picker.jsx";

describe("<ColorPicker />", () => {
    it("should render", () => {
        render(<ColorPicker />);
        expect(screen.getByTestId("colorpicker")).toBeInTheDocument();
    });

    it("should display color values", () => {
        const colors = ["#fff", "#000"];
        render(<ColorPicker values={colors} />);

        screen.queryByTestId("colorpicker-value").forEach((element, index) => {
            expect(element).toHaveStyle({
                backgroundColor: colors[index],
            });
        });
    });
});
