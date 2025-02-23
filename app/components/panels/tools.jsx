import React from "react";
import classNames from "classnames";
import {useUpdate} from "react-use";
import {LockIcon, UnlockIcon, DotsVerticalIcon} from "@josemi-icons/react";
import {ELEMENTS, TOOLS} from "../../constants.js";
import {Dropdown} from "../ui/dropdown.jsx";
import {Form} from "../form/index.jsx";
import {useEditor} from "../../contexts/editor.jsx";
import {themed} from "../../contexts/theme.jsx";
import {useTools} from "../../hooks/use-tools.js";

const PickPanel = props => (
    <div
        className={themed("absolute left-half p-1 rounded-lg shadow-md bottom-full mb-3", "toolbar.pick")}
        style={{
            transform: "translateX(-50%)",
        }}
    >
        <Form
            className="flex flex-row gap-2"
            data={props.values}
            items={props.items}
            separator={(
                <div className={themed("w-px h-6", "toolbar.pick.separator")} />
            )}
            onChange={props.onChange}
        />
    </div>
);

const PanelButton = props => {
    const classList = themed({
        "flex flex-col justify-center items-center flex px-4 py-2 gap-1 rounded-xl": true,
        "cursor-pointer": !props.active,
        "toolbar.button": true,
        "toolbar.button.active": props.active,
        "toolbar.button.inactive": !props.active,
        "pointer-events-none opacity-60 cursor-not-allowed": props.disabled,
    }, props.className);

    return (
        <div className={classList} onClick={props.onClick}>
            {props.icon && (
                <div className="text-xl flex items-center">
                    {props.icon}
                </div>
            )}
            {props.text && (
                <div className="text-3xs">
                    <strong>{props.text}</strong>
                </div>
            )}
        </div>
    );
};

// default visible tools
const defaultAlwaysVisibleTools = [
    TOOLS.DRAG,
    TOOLS.SELECT,
    ELEMENTS.SHAPE,
    ELEMENTS.ARROW,
    ELEMENTS.TEXT,
    ELEMENTS.DRAW,
    ELEMENTS.IMAGE,
    ELEMENTS.STICKER,
];

// default hidden tools (will be displayed in the more menu)
const defaultHiddenTools = [
    TOOLS.POINTER,
    ELEMENTS.NOTE,
    TOOLS.ERASER,
];

// Tools Panel component
export const ToolsPanel = () => {
    const update = useUpdate();
    const editor = useEditor();
    const tools = useTools();

    const handleLockClick = React.useCallback(() => {
        editor.state.toolLocked = !editor.state.toolLocked;
        update();
    }, []);

    const lockButtonClass = themed({
        "absolute left-full flex items-center cursor-pointer text-lg rounded-full p-2 ml-2": true,
        "toolbar.lock.active": editor.state.toolLocked,
        "toolbar.lock.inactive": !editor.state.toolLocked,
        "pointer-events-none opacity-40 cursor-not-allowed": editor.page.readonly,
    });

    return (
        <div className="flex items-center relative select-none">
            <div className={themed("rounded-2xl items-center flex gap-2 p-1", "toolbar", props.className)}>
                {defaultAlwaysVisibleTools.map(key => (
                    <div key={key} className="flex relative">
                        <PanelButton
                            text={tools[key].name || tools[key].text}
                            icon={tools[key].icon}
                            active={editor.state.tool === key}
                            disabled={editor.page.readonly}
                            onClick={tools[key.onSelect]}
                        />
                        {tools[key].quickPicks && key === editor.state.tool && (
                            <PickPanel
                                values={editor.defaults}
                                items={tools[key].quickPicks}
                                onChange={(field, value) => {
                                    editor.defaults[field] = value;
                                    if (typeof tools[key].onQuickPickChange === "function") {
                                        tools[key].onQuickPickChange(editor.defaults, field, value);
                                    }
                                    // Force and update of the component
                                    update();
                                }}
                            />
                        )}
                    </div>
                ))}
                <div className="flex self-stretch relative group" tabIndex="0">
                    <div className={themed("flex items-center cursor-pointer rounded-xl px-1", "toolbar.dots")}>
                        <div className="flex items-center text-xl">
                            <DotsVerticalIcon />
                        </div>
                    </div>
                    <Dropdown className="hidden group-focus-within:block bottom-full right-0 mb-2 w-48 z-20">
                        {defaultHiddenTools.map(key => (
                            <React.Fragment key={key}>
                                <Dropdown.CheckItem
                                    checked={editor.state.tool === key}
                                    onClick={tools[key].onSelect}>
                                    <Dropdown.Icon icon={tools[key].icon} />
                                    <span>{tools[key].name}</span>
                                </Dropdown.CheckItem>
                            </React.Fragment>
                        ))}
                    </Dropdown>
                </div>
            </div>
            <div className={lockButtonClass} onClick={handleLockClick}>
                {editor.state.toolLocked ? <LockIcon /> : <UnlockIcon />}
            </div>
        </div>
    );
};
