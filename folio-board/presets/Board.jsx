import React from "react";
import {BoardProvider} from "../contexts/BoardContext.jsx";
import {Layout, Renderer} from "../components/commons/index.jsx";
import {DEFAULT_BACKGROUND} from "../constants.js";

export const Board = props => {
    const [_, forceUpdate] = React.useReducer(x => x + 1, 0);
    const handleChange = values => {
        return props.onChange?.({
            title: props.title,
            elements: props.elements,
            assets: props.assets,
            grid: props.grid,
            background: props.background,
            ...(values || {}),
        });
    };
    const boardProps = {
        elements: props.elements,
        assets: props.assets,
        onUpdate: forceUpdate,
        onChange: handleChange,
    };

    return (
        <div className="position:relative overflow:hidden h:full w:full">
            <BoardProvider {...boardProps}>
                <Renderer
                    grid={props.grid}
                    background={props.background}
                    onChange={handleChange}
                    onScreenshot={props.onScreenshot}
                />
                <Layout
                    grid={props.grid}
                    background={props.background}
                    header={props.header}
                    onChange={handleChange}
                />
            </BoardProvider>
        </div>
    );
};

Board.defaultProps = {
    elements: [],
    assets: {},
    grid: true,
    background: DEFAULT_BACKGROUND,
    header: null,
    onChange: null,
    onScreenshot: null,
};
