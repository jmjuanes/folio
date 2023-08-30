import {isValidHexColor, colorShade} from "./colors.js";

describe("isValidHExColor", () => {
    it("should return 'true' if the provided value is a hex color", () => {
        const validHexColors = ["#aaa", "#bbbbbb", "#cccccc00"];

        validHexColors.forEach(value => {
            expect(isValidHexColor(value)).toBeTruthy();
        });
    });

    it("should return 'false' if the provided value is not a hex color", () => {
        const nonValidHexColors = ["transparent", "aaaa", null];

        nonValidHexColors.forEach(value => {
            expect(isValidHexColor(value)).toBeFalsy();
        });
    });
});

describe("colorShade", () => {
    it("should return a lighter color than provided", () => {
        expect(colorShade("#ffffff", -20)).toEqual("#ebebeb");
    });

    it("should return a darker color than provided", () => {
        expect(colorShade("#000000", 20)).toEqual("#141414");
    });
});
