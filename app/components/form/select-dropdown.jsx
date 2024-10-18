import React from "react";
import {ChevronDownIcon, CheckIcon} from "@josemi-icons/react";
import {themed} from "../../contexts/theme.jsx";

const SelectDropdownButton = ({text = "", onClick}) => (
    <div className="flex items-center justify-between w-full rounded-md border border-neutral-200 h-8 px-2 cursor-pointer" onClick={onClick}>
        <div className="text-xs">{text}</div>
        <div className="flex items-center">
            <ChevronDownIcon />
        </div>
    </div>
);

const SelectDropdownItem = ({selected = false, text = "", onClick}) => (
    <div className="m-1 pl-8 pr-2 py-1 relative hover:bg-neutral-100 cursor-pointer rounded-sm" onClick={onClick}>
        {selected && (
            <div className="absolute top-0 left-0 bottom-0 flex items-center pl-2">
                <CheckIcon />
            </div>
        )}
        <div className="text-xs">{text}</div>
    </div>
);

// @description Select dropdown component
export const SelectDropdown = ({value, values = [], placeholder = "Select a value", onChange}) => {
    const [toggle, setToggle] = React.useState(false);
    const dropdownClassList = themed({
        "top-full left-0 mt-px w-64 z-40 absolute rounded-md bg-white border border-neutral-200 shadow-sm": true,
        "hidden": !toggle,
        "block": toggle,
    });
    return (
        <div className="flex relative">
            <SelectDropdownButton
                text={values.find(item => item.value === value)?.text || value || placeholder}
                onClick={() => setToggle(!toggle)}
            />
            <div className={dropdownClassList}>
                {values.map(item => (
                    <SelectDropdownItem
                        key={item.value}
                        selected={item.value === value}
                        text={item.text ?? item.value}
                        onClick={() => onChange(item.value)}
                    />
                ))}
            </div>
        </div>
    );
};
