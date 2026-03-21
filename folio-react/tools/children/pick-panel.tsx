import React from "react";
import { Form } from "../../components/form/index.jsx";

export type PickPanelProps = {
    values: any;
    items: any;
    onChange: (field: string, value: any) => void;
};

export const PickPanel = (props: PickPanelProps): React.JSX.Element => {
    const pickPanelClassName = [
        "absolute left-half p-1 rounded-lg shadow-md bottom-full mb-3",
        "bg-white border-1 border-gray-200 shadow-sm",
    ].join(" ");
    return (
        <div className={pickPanelClassName} style={{ transform: "translateX(-50%)" }}>
            <Form
                className="flex flex-row gap-2"
                data={props.values}
                items={props.items}
                separator={<div className="w-px h-6 bg-gray-200" />}
                onChange={props.onChange}
            />
        </div>
    );
};
