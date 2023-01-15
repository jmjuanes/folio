import React from "react";
import classNames from "classnames";
import {SaveIcon, TrashIcon} from "../icons/index.jsx";
import {DEFAULT_BACKGROUND} from "../../constants.js";

const MenuButton = props => {
    const classList = classNames({
        "d:flex items:center gap:3": true,
        "r:md cursor:pointer p:3": true,
        "bg:dark-500:hover": true,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            <div className="d:flex items:center text:lg text:white">
                {props.icon}
            </div>
            <div className="d:flex items:center text:white">
                <strong>{props.text}</strong>
            </div>
        </div>
    );
};

const MenuField = props => (
    <div className="p:3 d:flex g:3 items:center">
        <div className="text:white w:full">
            <strong>{props.text}</strong>
        </div>
        <div className="text:dark-700">
            {props.children}
        </div>
    </div>
);

export const Menu = props => (
    <div className={classNames("position:absolute z:6", props.className)}>
        <div className="p:4 w:64 bg:dark-700 text:white r:lg d:flex flex:col">
            <MenuButton
                icon={(<SaveIcon />)}
                text="Save as..."
            />
            <MenuButton
                icon={(<TrashIcon />)}
                text="Reset board"
            />
            <div className="py:px h:0 bg:dark-100 my:2" />
            <MenuField text="Background">
                <input
                    type="color"
                    className="b:2 b:white b:solid h:0 w:0 p:3 r:sm cursor:pointer"
                    style={{
                        appearance: "none",
                        backgroundColor: props.background || DEFAULT_BACKGROUND,
                    }}
                    defaultValue={props.background || DEFAULT_BACKGROUND}
                    onChange={event => {
                        return props.onChange?.({
                            background: event.target.value || DEFAULT_BACKGROUND,
                        });
                    }}
                />
            </MenuField>
            <MenuField text="Grid">
                <input
                    type="checkbox"
                    className="p:2 b:2 b:white b:solid b:white:checked"
                    defaultValue={props.grid}
                    onChange={event => {
                        return props.onChange?.({
                            grid: !!event.target.value,
                        });
                    }}
                />
            </MenuField>
        </div>
    </div>
);

Menu.defaultProps = {
    className: "",
    grid: false,
    background: DEFAULT_BACKGROUND,
    onChange: null,
    onSaveClick: null,
    onClearClick: null,
};
