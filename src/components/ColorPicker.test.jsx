import {fireEvent, render, screen} from "@testing-library/react";
import {ColorPicker} from "./ColorPicker.jsx";

describe("ColorPicker", () => {
    it("should render", () => {
        render(
            <ColorPicker value="#fff" values={["#aaa", "#bbb"]} />
        );

        expect(screen.getByTestId("colorpicker")).toBeDefined();
    });

    it("should set the current color value in the color preview and input", () => {
        const colorHex = "#fff";
        const colorRgb = "rgb(255, 255, 255)";
        render(
            <ColorPicker value={colorHex} values={[]} />
        );

        expect(screen.getByTestId("colorpicker:preview").style?.backgroundColor).toEqual(colorRgb);
        expect(screen.getByTestId("colorpicker:input").value).toEqual(colorHex);
    });

    it("should emit the onChange listener when user changes the color", () => {
        const handleChange = jest.fn();
        const newColor = "#000";
        render(
            <ColorPicker value="#fff" onChange={handleChange} />
        );

        const inputElement = screen.getByTestId("colorpicker:input");
        fireEvent.change(inputElement, {
            target: {
                value: newColor,
            },
        });

        expect(handleChange).toHaveBeenCalledWith(newColor);
    });

    it("should display the provided color palette", () => {
        const colorPalette = ["#aaa", "#bbb", "#ccc"];
        render(
            <ColorPicker value="#fff" values={colorPalette} />
        );

        colorPalette.forEach(color => {
            expect(screen.getByTestId("color:" + color)).toBeDefined();
        });
    });

    it("should emit the onChange listener when user clicks on a color in the palette", () => {
        const color = "#aaa";
        const handleChange = jest.fn();
        render(
            <ColorPicker value="#fff" values={[color]} onChange={handleChange} />
        );

        fireEvent.click(screen.getByTestId("color:" + color));
        expect(handleChange).toHaveBeenCalledWith(color);
    });
});
