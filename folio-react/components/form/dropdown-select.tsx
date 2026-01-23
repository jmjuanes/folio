import React from "react";
import classNames from "classnames";
import { ChevronDownIcon } from "@josemi-icons/react";
import { Dropdown } from "../ui/dropdown.tsx";

export type DropdownSelectValue = {
    value: string;
    text?: string;
};

export type DropdownSelectProps = {
    value: string;
    values: SelectValue[] | string[];
    emptyValueText?: string;
    onChange: (value: string) => void;
};

export const DropdownSelect = (props: DropdownSelectProps): React.JSX.Element => (
    <Dropdown.Portal
        id="form:dropdown-select"
        toggleClassName={classNames({
            "relative w-full px-2 py-0 h-8 rounded-md outline-0 text-xs": true,
            "flex items-center justify-between": true,
            "bg-white border-1 border-gray-200 text-current": true,
            "pointer-events-none opacity-60": props.values.length === 0,
        })}
        contentClassName="absolute z-50"
        toggleRender={() => {
            const selectedItem = (props.values || []).find((item: DropdownSelectValue) => {
                return item?.value === props.value || props.value === item;
            });
            return (
                <React.Fragment>
                    <div className={!props.value ? "opacity-60" : "opacity-100"}>
                        <span>{selectedItem?.text ?? selectedItem ?? props.emptyValueText ?? "-"}</span>
                    </div>
                    <div className="flex items-center text-base">
                        <ChevronDownIcon />
                    </div>
                </React.Fragment>
            );
        }}
        contentRender={closeDropdown => (
            <div className="border-1 border-gray-200 bg-white p-1 shadow-sm rounded-md" style={{width:"21rem"}}>
                {(props.values || []).map((item: DropdownSelectValue) => {
                    const active = props.value === item?.value || props.value === item;
                    const itemClassName = classNames({
                        "rounded-sm text-sm px-2 py-1 select-none text-current": true,
                        "bg-gray-200": active,
                        "bg-white hover:bg-gray-100 cursor-pointer": !active,
                    });
                    const handleClick = () => {
                        closeDropdown();
                        props.onChange(item?.value ?? item);
                    };
                    return (
                        <div className={itemClassName} onClick={handleClick}>
                            <span>{item?.text || item?.value || item}</span>
                        </div>
                    );
                })}
            </div>
        )}
    />
);
