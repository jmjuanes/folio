import {create} from "react-test-renderer";

import {Dialog} from "./Dialog.jsx";

describe("Dialog", () => {
    it("should render", () => {
        const component = create(<Dialog />);

        expect(component.toJSON).toMatchSnapshot();
    });
});
