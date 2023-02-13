import React from "react";
import {BoardProvider} from "../contexts/BoardContext.jsx";
import {Layout, Renderer} from "../components/commons/index.jsx";
import {DEFAULT_BACKGROUND} from "../constants.js";

export const SimpleBoard = props => {
    const [_, onUpdate] = React.useReducer(x => x + 1, 0);

    return (
        <div className="position:relative overflow:hidden h:full w:full">
            <BoardProvider
                elements={props.elements}
                assets={props.assets}
                onChange={props.onChange}
                onUpdate={props.onUpdate}
            >
                <Renderer
                    grid={props.grid}
                    background={props.background}
                    onChange={props.onChange}
                />
                <Layout
                    grid={props.grid}
                    background={props.background}
                    onChange={props.onChange}
                />
            </BoardProvider>
        </div>
    );
};

SimpleBoard.defaultProps = {
    elements: [],
    assets: {},
    grid: true,
    background: DEFAULT_BACKGROUND,
    onChange: null,
};
