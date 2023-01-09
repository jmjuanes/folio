import React from "react";
import {BoardProvider} from "../contexts/BoardContext.jsx";
import {Layout, Renderer} from "../components/commons/index.jsx";

const InnerBoard = props => {
    return (
        <BoardProvider>
            <Layout title={props.title} pages={props.pages}>
                <Renderer />
            </Layout>
        </BoardProvider>
    );
};

export const Board = props => {
    const [state, setState] = React.useState({
        currentPage: props.pages[0].id,
    });

    // Get the current active page
    const pageData = props.pages.find(page => page.id === state.currentPage);
    const pages = props.pages.map(page => ({
        id: page.id,
        title: page.title,
    }));

    return React.createElement(InnerBoard, {
        key: state.currentPage,
        title: pageData.title,
        elements: pageData.elements || [],
        assets: props.assets,
        pages: pages,
    });
};

Board.defaultProps = {
    assets: {},
    pages: [],
    settings: {},
    onChange: null,
};
