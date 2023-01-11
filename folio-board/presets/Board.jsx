import React from "react";
import {BoardProvider} from "../contexts/BoardContext.jsx";
import {Layout, Renderer} from "../components/commons/index.jsx";

export const Board = props => {
    const [_, forceUpdate] = React.useReducer(x => x + 1, 0);

    return (
        <BoardProvider
            elements={props.elements}
            assets={props.assets}
            onUpdate={() => forceUpdate()}
            onChange={() => null}
        >
            <Layout title={props.title}>
                <Renderer />
            </Layout>
        </BoardProvider>
    );
};

Board.defaultProps = {
    title: "",
    elements: [],
    assets: {},
    onChange: null,
};
