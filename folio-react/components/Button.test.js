import {render} from "@testing-library/react";

import {Button} from "./Button.js";
jest.mock("../styles.js", () => ({
    css: () => "button",  
}));

it("should render", () => {
    const {container} = render(<Button />);

    expect(container.querySelector("div.button")).not.toBeNull();
});

it("should have the 'is-active' class when the active prop is 'true'", () => {
    const {container} = render(<Button active />);

    expect(container.querySelector("div.button.is-active")).not.toBeNull();
});

it("should have the 'is-disabled' class when the disabled prop is 'true'", () => {
    const {container} = render(<Button disabled />);

    expect(container.querySelector("div.button.is-disabled")).not.toBeNull();
});

