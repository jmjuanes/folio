import { expect, jest } from "@jest/globals";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { FORM_OPTIONS } from "../../../constants.js";
import { Form } from "../index.jsx";

describe("<Form />", () => {
    const defaultItems = {
        text: {
            type: FORM_OPTIONS.TEXT,
            title: "Text Title",
        },
    };
    it("should render", () => {
        render(<Form items={defaultItems} data={{}} />);
        expect(screen.getByTestId("form")).toBeInTheDocument();
    });
});
