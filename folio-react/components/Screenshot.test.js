import {render} from "@testing-library/react";

import {Screenshot} from "./Screenshot.js";
jest.mock("../styles.js", () => ({
    css: () => "",
    outlineButtonClass: "button",
    buttonIconClass: "icon",
    scrimClass: "scrim",
    titleClass: "title",
}));

it("should render", () => {
    const {getByText} = render(<Screenshot />);

    expect(getByText("Full capture")).toBeDefined();
    expect(getByText("Select region")).toBeDefined();
});
