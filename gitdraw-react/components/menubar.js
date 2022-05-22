import React from "react";
// import kofi from "kofi";
import {Button} from "./button.js";

export const Menubar = props => {
    const [active, setActive] = React.useState(false);
    return (
        <div className="is-absolute has-top-none has-left-none has-pt-4 has-pl-4">
            <div className="has-radius-md has-bg-gray-100 has-p-2 is-flex">
                <Button
                    icon="bars"
                    active={active}
                    onClick={() => setActive(!active)}
                />
            </div>
        </div>
    );
};
