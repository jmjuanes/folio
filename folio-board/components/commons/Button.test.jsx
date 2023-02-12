import TestRenderer from "react-test-renderer";
import {Button} from "./Button.jsx";

describe("Button", () => {
    it("should render", () => {
        const testRenderer = TestRenderer.create(<Button />);

        expect(testRenderer.toJSON()).toMatchSnapshot();
    });

    it("should render button text and icon", () => {
        const testRenderer = TestRenderer.create(<Button text="TEXT" icon="ICON" />);
        const testInstance = testRenderer.root;

        expect(testInstance.findByProps({"data-test":"icon"}).children[0]).toBe("ICON");
        expect(testInstance.findByProps({"data-test":"text"}).children[0]).toBe("TEXT");
    });
});
