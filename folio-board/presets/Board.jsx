import React from "react";
import {BoardProvider} from "../contexts/BoardContext.jsx";
import {ToastProvider} from "../contexts/ToastContext.jsx";
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
            <ToastProvider>
                <BoardProvider {...boardProps}>
                    <Renderer
                        grid={props.grid}
                        background={props.background}
                        onChange={handleChange}
                    />
                    <Layout
                        title={props.title}
                        grid={props.grid}
                        background={props.background}
                        onChange={handleChange}
                        onSave={props.onSave}
                        onCreate={props.onCreate}
                        onDelete={props.onDelete}
                    />
                </BoardProvider>
            </ToastProvider>
        </div>
    );
};

Board.defaultProps = {
    id: "",
    title: "",
    elements: [],
    assets: {},
    grid: true,
    background: DEFAULT_BACKGROUND,
    onChange: null,
    onSave: null,
    onCreate: null,
    onDelete: null,
};
