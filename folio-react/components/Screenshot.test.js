import {render} from "@testing-library/react";

import {Screenshot} from "./Screenshot.js";
jest.mock("../styles.js", () => ({
    css: () => "",
    elements: {},
}));

it("should render", () => {
    const {getByText} = render(<Screenshot />);

    expect(getByText("Full capture")).toBeDefined();
    expect(getByText("Select region")).toBeDefined();
});
