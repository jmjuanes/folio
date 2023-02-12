import {create} from "react-test-renderer";
import {Menu} from "./Menu.jsx";
import {Button} from "../commons/Button.jsx";
import {Dropdown} from "../commons/Dropdown.jsx";

describe("Menu", () => {
    it("should pass the disabled prop to Button", () => {
        const testRenderer = create(<Menu disabled />);
        const testInstance = testRenderer.root;

        expect(testInstance.findByType(Button).props.disabled).toBeTruthy();
    });

    it("should not render Dropdown if menu is disabled", () => {
        const testRenderer = create(<Menu disabled />);
        const testInstance = testRenderer.root;

        expect(testInstance.findAllByType(Dropdown)).toHaveLength(0);
    });
});
