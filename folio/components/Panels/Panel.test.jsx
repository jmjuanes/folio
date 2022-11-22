import {create} from "react-test-renderer";

import {Panel, PanelButton} from "./Panel.jsx";

describe("Panel", () => {
    it("should render", () => {
        const component = create(<Panel position="top-left" />);

        expect(component.toJSON).toMatchSnapshot();
    });
});

describe("PanelButton", () => {
    it("should render", () => {
        const component = create(<Panel position="top-left" />);

        expect(component.toJSON).toMatchSnapshot();
    });

    it("should have the 'is-active' class when the active prop is 'true'", () => {
        const component = create(<PanelButton active={true} />);
        const root = component.root;

        expect(root.findByType("div").props.className).toEqual(
            expect.stringContaining("is-active"),
        );
    });

    it("should have the 'is-disabled' class when the disabled prop is 'true'", () => {
        const component = create(<PanelButton disabled={true} />);
        const root = component.root;

        expect(root.findByType("div").props.className).toEqual(
            expect.stringContaining("is-disabled"),
        );
    });
});
