import React from "react";
import classNames from "classnames";
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
            "flex items-center": true,
            "bg-white border-1 border-gray-200 text-current": true,
            "pointer-events-none opacity-80": props.values.length === 0,
        })}
        contentClassName="absolute z-50"
        toggleRender={() => {
            const value = (props.values || []).find(item => {
                return item?.value === props.value || props.value === item;
            });
            return (
                <span>{value || props.emptyValueText || "-"}</span>
            );
        }}
        contentRender={closeDropdown => (
            <Dropdown className="" style={{width:"21rem"}}>
                {(props.values || []).map((item: DropdownSelectValue) => {
                    const itemClassName = classNames({
                        "bg-gray-200": props.value === item?.value || props.value === item,
                    });
                    const handleClick = () => {
                        closeDropdown();
                        props.onChange(item?.value ?? item);
                    };
                    return (
                        <Dropdown.Item className={itemClassName} onClick={handleClick}>
                            <span>{item?.text || item?.value || item}</span>
                        </Dropdown.Item>
                    );
                })}
            </Dropdown>
        )}
    />
);
