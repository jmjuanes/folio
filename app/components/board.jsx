import React from "react";
import {Editor} from "folio-react/components/editor.jsx";

// 2. components overrides
const componentsOverrides = {
};

// @description board route
export const BoardRoute = props => {
    return (
        <div className="fixed top-0 left-0 h-full w-full bg-white text-base flex">
            <Editor
                store={store}
                components={componentsOverrides}
            />
        </div>
    );
};
