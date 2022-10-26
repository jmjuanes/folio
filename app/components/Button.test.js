import {create} from "react-test-renderer";

import {Button} from "./Button.js";

describe("Button", () => {
    it("should render", () => {
        const component = create(<Button />);

        expect(component.toJSON).toMatchSnapshot();
    });

    it("should have the 'is-active' class when the active prop is 'true'", () => {
        const component = create(
            <Button active></Button>
        );
        const root = component.root;

        expect(root.findByType("div").props.className).toEqual(
            expect.stringContaining("is-active"),
        );
    });

    it("should have the 'is-disabled' class when the disabled prop is 'true'", () => {
        const component = create(
            <Button disabled></Button>
        );
        const root = component.root;

        expect(root.findByType("div").props.className).toEqual(
            expect.stringContaining("is-disabled"),
        );
    });
});
