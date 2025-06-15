import React from "react";
import classNames from "classnames";
import {useUpdate} from "react-use";
import {LockIcon, UnlockIcon, DotsVerticalIcon, renderIcon} from "@josemi-icons/react";
import {Dropdown} from "../ui/dropdown.jsx";
import {Form} from "../form/index.jsx";
import {useEditor} from "../../contexts/editor.jsx";
import {useContextMenu} from "../../contexts/context-menu.jsx";
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

const ToolbarButton = props => {
    const classList = themed({
        "flex flex-col justify-center items-center px-4 py-2 gap-1 rounded-xl": true,
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
                    {typeof props.icon === "string" ? renderIcon(props.icon) : props.icon}
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

// @description toolbar panel dropdown item
const ToolbarDropdownItem = ({checked, disabled, onClick, icon, text}) => (
    <Dropdown.CheckItem checked={checked} disabled={disabled} onClick={onClick}>
        <Dropdown.Icon icon={icon} />
        <span>{text}</span>
    </Dropdown.CheckItem>
);

// @description Toolbar panel component
export const ToolbarPanel = () => {
    const update = useUpdate();
    const editor = useEditor();
    const tools = useTools();
    const {hideContextMenu} = useContextMenu();
    const prevSelectedTool = React.useRef(editor.state.tool);
    const [primaryTools, secondaryTools] = React.useMemo(() => {
        const keys = Object.keys(tools);
        return [
            keys.filter(key => tools[key].primary),
            keys.filter(key =>!tools[key].primary),
        ];
    }, [tools]);

    // when a tool is selected, make sure to hide the context menu
    React.useEffect(() => {
        if (prevSelectedTool.current !== editor.state.tool) {
            prevSelectedTool.current = editor.state.tool;
            hideContextMenu();
        }
    }, [editor.state.tool]);

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
            <div className={themed("rounded-2xl items-center flex gap-2 p-1", "toolbar")}>
                {primaryTools.map(key => (
                    <div key={key} className="flex relative">
                        <ToolbarButton
                            text={tools[key].name || tools[key].text}
                            icon={tools[key].icon}
                            active={editor.state.tool === key}
                            disabled={editor.page.readonly && !tools[key].toolEnabledOnReadOnly}
                            onClick={() => {
                                tools[key].onSelect(editor);
                            }}
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
                {secondaryTools.length > 0 && (
                    <div className="flex self-stretch relative group" tabIndex="0">
                        <div className={themed("flex items-center cursor-pointer rounded-xl px-1", "toolbar.dots")}>
                            <div className="flex items-center text-xl">
                                <DotsVerticalIcon />
                            </div>
                        </div>
                        <Dropdown className="hidden group-focus-within:block bottom-full right-0 mb-2 w-48 z-20">
                            {secondaryTools.map(key => (
                                <ToolbarDropdownItem
                                    key={key}
                                    checked={editor.state.tool === key}
                                    disabled={editor.page.readonly && !tools[key].toolEnabledOnReadOnly}
                                    onClick={() => {
                                        tools[key].onSelect(editor);
                                    }}
                                    icon={tools[key].icon}
                                    text={tools[key].name}
                                />
                            ))}
                        </Dropdown>
                    </div>
                )}
            </div>
            <div className={lockButtonClass} onClick={handleLockClick}>
                {editor.state.toolLocked ? <LockIcon /> : <UnlockIcon />}
            </div>
        </div>
    );
};
