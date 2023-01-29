import React from "react";
import {EXPORT_FORMATS, exportToFile, exportToClipboard} from "folio-core";
import {BoardProvider} from "../contexts/BoardContext.jsx";
import {ToastProvider, useToasts} from "../contexts/ToastContext.jsx";
import {Layout, Renderer, Toaster} from "../components/commons/index.jsx";
import {DEFAULT_BACKGROUND, FONT_FACES} from "../constants.js";
import {formatDate} from "../utils/date.js";

const InnerBoard = props => {
    const [_, forceUpdate] = React.useReducer(x => x + 1, 0);
    const {addToast} = useToasts();
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
                    onScreenshot={region => {
                        const exportOptions = {
                            elements: props.elements || [],
                            format: EXPORT_FORMATS.PNG,
                            fonts: Object.values(FONT_FACES),
                            crop: region,
                        };
                        exportToClipboard(exportOptions).then(() => {
                            addToast("Screenshot copied to clipboard.");
                        });
                    }}
                />
                <Layout
                    title={props.title}
                    grid={props.grid}
                    background={props.background}
                    onChange={handleChange}
                    onExport={values => {
                        const exportOptions = {
                            elements: props.elements || [],
                            // format: EXPORT_FORMATS.PNG,
                            filename: `untitled-${formatDate()}`,
                            fonts: Object.values(FONT_FACES),
                            ...values,
                        };
                        exportToFile(exportOptions).then(filename => {
                            addToast(`Board exported as '${filename}'`);
                        });
                    }}
                />
                <Toaster />
            </BoardProvider>
        </div>
    );
};

export const Board = props => (
    <ToastProvider>
        <InnerBoard {...props} />
    </ToastProvider>
);

Board.defaultProps = {
    id: "",
    title: "",
    elements: [],
    assets: {},
    grid: true,
    background: DEFAULT_BACKGROUND,
    onChange: null,
};
