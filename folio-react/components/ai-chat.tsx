import React from "react";
import classNames from "classnames";
import { renderIcon, SparklesIcon } from "@josemi-icons/react";
import { PREFERENCES } from "../constants.js";
import { Alert, AlertVariant } from "./ui/alert.tsx";
import { Dropdown, DropdownPortalPosition } from "./ui/dropdown.tsx";
import { Panel } from "./ui/panel.tsx";
import { useAi, AiChatMessageRole, AiTool } from "../contexts/ai.tsx";
import { usePreferences } from "../contexts/preferences.tsx";
import { useEditor } from "../contexts/editor.jsx";
import { formatDate } from "../utils/dates.ts";
import type { AiChatMessage } from "../contexts/ai.tsx";

const availableTools = [
    {
        id: AiTool.GENERATE_ELEMENTS,
        title: "Generate Folio Elements",
        description: "Create a drawing using folio native elements.",
    },
    // {
    //     id: AiTool.GENERATE_DIAGRAM,
    //     title: "Generate Diagram",
    //     description: "Describe the diagram you want to create.",
    // },
    // {
    //     id: AiTool.GENERATE_SVG,
    //     title: "Generate SVG",
    //     description: "Create a new SVG using folio native elements.",
    // },
];

type AiChatButtonProps = {
    icon: string;
    disabled?: boolean;
    onClick: () => void;
};

const AiChatButton = (props: AiChatButtonProps): React.JSX.Element => {
    const buttonClassName = classNames({
        "border-0 flex items-center rounded-full p-2 text-lg": true,
        "bg-gray-950 hover:bg-gray-900 text-white": true,
        "cursor-pointer": !props.disabled,
        "opacity-60 cursor-not-allowed": !!props.disabled,
    });
    return (
        <button className={buttonClassName} onClick={props.onClick}>
            {renderIcon(props.icon)}
        </button>
    );
};

type AiChatInputProps = {
    placeholder?: string;
    disabled?: boolean;
    inputRows?: number;
    tool?: AiTool;
    toolSelectionDisabled?: boolean;
    onToolChange: (tool: AiTool) => void;
    onSubmit: (inputText: string) => void;
};

const AiChatInput = (props: AiChatInputProps): React.JSX.Element => {
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const handleSubmit = React.useCallback(() => {
        if (inputRef?.current?.value) {
            props.onSubmit(inputRef.current.value.trim());
        }
    }, [props.onSubmit]);

    return (
        <div className="bg-gray-100 rounded-xl border-0 p-4">
            <textarea
                ref={inputRef}
                disabled={!!props.disabled}
                placeholder={props.placeholder}
                rows={props?.inputRows ?? 4}
                className="text-sm bg-transparent outline-none border-0 w-full min-h-24 p-0"
            />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Dropdown.Portal
                        id="ai-tools"
                        disabled={props.disabled}
                        position={DropdownPortalPosition.TOP_LEFT}
                        toggleClassName={classNames({
                            "relative w-full px-1 py-1 outline-0": true,
                            "flex items-center justify-center": true,
                            "opacity-60 hover:opacity-100 cursor-pointer": !props.disabled,
                            "opacity-40 cursor-not-allowed": !!props.disabled,
                        })}
                        contentClassName="absolute z-50"
                        toggleRender={() => (
                            <div className="flex items-center text-xl">
                                {renderIcon("sliders")}
                            </div>
                        )}
                        contentRender={() => (
                            <Dropdown className="flex flex-col gap-1 w-56 p-1" style={{ position: "relative" }}>
                                {availableTools.map((tool) => (
                                    <Dropdown.Item key={tool.id} active={props.tool === tool.id} disabled={props.toolSelectionDisabled} onClick={() => props.onToolChange(tool.id)}>
                                        <div className="flex flex-col">
                                            <div className="font-bold text-sm">{tool.title}</div>
                                            <div className="text-2xs opacity-60">{tool.description}</div>
                                        </div>
                                    </Dropdown.Item>
                                ))}
                            </Dropdown>
                        )}
                    />
                </div>
                <AiChatButton
                    icon="arrow-up"
                    disabled={!!props.disabled}
                    onClick={handleSubmit}
                />
            </div>
        </div>
    );
};

type AiChatMessageActionButtonProps = {
    icon: string;
    onClick: () => void;
};

const AiChatMessageActionButton = (props: AiChatMessageActionButtonProps): React.JSX.Element => (
    <button className="bg-transparent border-0 flex items-center justify-center text-xl opacity-40 hover:opacity-80 cursor-pointer" onClick={props.onClick}>
        {renderIcon(props.icon)}
    </button>
);

type AiChatMessageBlockProps = {
    role: AiChatMessageRole;
    text?: string;
    elements?: any;
    loading?: boolean;
    timestamp?: string;
};

const AiChatMessageBlock = (props: AiChatMessageBlockProps): React.JSX.Element => {
    const containerClassName = classNames({
        "group flex w-full gap-2 items-center": true,
        "justify-start": props.role === AiChatMessageRole.ASSISTANT,
        "justify-end": props.role === AiChatMessageRole.USER,
    });
    const actionsClassName = classNames({
        "group-hover:opacity-100 opacity-0 flex items-center gap-1": true,
        "order-first": props.role === AiChatMessageRole.USER,
        "order-last": props.role === AiChatMessageRole.ASSISTANT,
    });
    const messageClassName = classNames({
        "px-4 py-3 max-w-64 flex flex-col gap-1 rounded-2xl": true,
        "bg-gray-100 text-gray-950 rounded-tl-none": props.role === AiChatMessageRole.ASSISTANT,
        "bg-gray-200 text-gray-950 rounded-tr-none": props.role === AiChatMessageRole.USER,
    });
    return (
        <div className="flex flex-col gap-1 w-full">
            <div className={containerClassName}>
                <div className={messageClassName}>
                    {props.text && (
                        <div className="text-sm">{props.text}</div>
                    )}
                    {props.loading && (
                        <div className="flex text-xl animate-pulse text-gray-600">
                            {renderIcon("dots")}
                        </div>
                    )}
                </div>
                <div className={actionsClassName}>
                    <AiChatMessageActionButton icon="copy" onClick={() => { }} />
                    <AiChatMessageActionButton icon="trash" onClick={() => { }} />
                </div>
            </div>
            {props.role === AiChatMessageRole.USER && props.timestamp && (
                <div className="flex items-center justify-end">
                    <span className="text-3xs opacity-60">{formatDate(props.timestamp)}</span>
                </div>
            )}
        </div>
    );
};

export const AiChat = (): React.JSX.Element => {
    const [activeChatId, setActiveChatId] = React.useState<string>("");
    const [selectedTool, setSelectedTool] = React.useState<AiTool>(AiTool.GENERATE_ELEMENTS);
    const [loading, setLoading] = React.useState<Boolean>(false);
    const [error, setError] = React.useState<Error | null>(null);
    // const scrollRef = React.useRef<HTMLDivElement>(null);
    const ai = useAi();
    const editor = useEditor();
    const preferences = usePreferences();

    // get active chat instance
    const chats = ai?.chat.getChats() || [];
    const activeChat = activeChatId ? ai?.chat.getChat(activeChatId) : null;
    const messages = ai?.chat.getMessages(activeChatId) || [];

    // run the appropiate model based on the chat type
    const callTool = React.useCallback((prompt: string): Promise<any> => {
        if (ai) {
            return ai?.tools.generateElements(prompt, messages);
        }
        return Promise.reject(new Error("AI is not configured"));
    }, [ai, activeChatId, messages?.length]);

    // when the user types and sends a message, we have to register the message
    // and call the tool
    const handleMessageSubmit = React.useCallback((prompt: string) => {
        let currentChatId = activeChatId;
        setLoading(true);
        setError(null);
        // 1. if we do not have an active chat, we have to create one
        if (!activeChatId) {
            const chat = ai?.chat.addChat({ tool: selectedTool });
            setActiveChatId(chat?.id || "");
            currentChatId = chat?.id || "";
        }
        // 2. add the user message to the chat
        ai?.chat.addMessage(currentChatId, { text: prompt });
        // 3. call the tool
        callTool(prompt)
            .then((response: any) => {
                ai?.chat.addMessage(currentChatId, {
                    role: AiChatMessageRole.ASSISTANT,
                    text: response?.text,
                    elements: response?.elements,
                });
            })
            .catch(responseError => {
                console.error(responseError?.message);
                setError(responseError);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [ai, activeChatId, callTool]);

    // clear chats
    const handleClearChats = React.useCallback(() => {
        // 1. if there is an active chat, the trash button will remove the current
        if (activeChatId) {
            ai?.chat.removeChat(activeChatId);
        }
        // 2. if there is no active chat, the trash button will remove all chats
        else {
            ai?.chat.clearChats();
        }
        setActiveChatId("");
    }, [ai, activeChatId]);

    // React.useEffect(() => {
    //     if (scrollRef.current && activeChatId) {
    //         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    //     }
    // }, [activeChatId]);

    // reset the error message when the user changes the chat
    React.useEffect(() => setError(null), [activeChatId]);

    // check if user has reached the maximum numbre of messages
    const hasReachedMaxMessages = React.useMemo<boolean>(() => {
        return messages?.length >= (preferences[PREFERENCES.AI_CHAT_MAX_MESSAGES] as number);
    }, [messages?.length, preferences]);

    // hook to check if the input should be disabled
    const isInputDisabled = React.useMemo<boolean>(() => {
        // 1. if the chat is loading or there are no ai instance available, the input should be disabled
        // 2. if the chat has reached the maximum number of messages, the input should be disabled
        if (!ai || loading || hasReachedMaxMessages) {
            return true;
        }
        // 3. if the chat has reached the maximum number of chats, the input should be disabled
        // if (chats?.length >= (preferences[PREFERENCES.AI_CHAT_MAX_CHATS] as number)) {
        //     return true;
        // }
        return false;
    }, [ai, loading, hasReachedMaxMessages]);

    return (
        <Panel.Content>
            <Panel.Header>
                <Panel.HeaderTitle
                    showBackButton={!!activeChatId}
                    title={activeChatId ? (activeChat?.title || "Untitled Chat") : "Folio AI"}
                    onBackButtonClick={() => setActiveChatId("")}
                />
                <div className="flex items-center gap-1">
                    <Panel.HeaderButton
                        icon="plus"
                        disabled={!activeChatId}
                        onClick={() => setActiveChatId("")}
                    />
                    <Panel.HeaderButton
                        icon="trash"
                        disabled={!activeChatId || chats?.length === 0}
                        onClick={() => handleClearChats()}
                    />
                    <Dropdown.Portal
                        id="ai-chat-history"
                        position={DropdownPortalPosition.BOTTOM_RIGHT}
                        disabled={chats?.length === 0}
                        toggleRender={() => (
                            <Panel.HeaderButton
                                icon="history"
                                disabled={chats?.length === 0}
                            />
                        )}
                        contentClassName="absolute z-50"
                        contentRender={() => (
                            <Dropdown className="flex flex-col gap-0 w-56 p-1 mt-1" style={{ position: "relative" }}>
                                <div className="flex flex-col gap-1 overflow-y-auto max-h-64">
                                    {chats.map(chat => (
                                        <Dropdown.Item key={chat.id} active={chat.id === activeChatId} onClick={() => setActiveChatId(chat.id)}>
                                            <Dropdown.Icon icon="drawing" />
                                            <span>{chat.title}</span>
                                        </Dropdown.Item>
                                    ))}
                                </div>
                                <Dropdown.Separator />
                                <Dropdown.Item onClick={() => ai?.chat.clearChats()}>
                                    <Dropdown.Icon icon="trash" />
                                    <span>Clear history</span>
                                </Dropdown.Item>
                            </Dropdown>
                        )}
                    />
                </div>
            </Panel.Header>
            <Panel.Body className="grow flex flex-col justify-between gap-4 h-full min-h-0">
                {(!activeChatId || messages?.length === 0) && (
                    <div className="flex flex-col items-center justify-center gap-4 h-full">
                        <div className="flex flex-col items-center gap-6 px-16 py-0">
                            <div className="flex items-center text-4xl p-3 rounded-full text-white" style={{ background: "linear-gradient(60deg, #4A74E6, #8D54E9)" }}>
                                <SparklesIcon />
                            </div>
                            <div className="text-xl font-bold text-center leading-tight" style={{ color: "#4A74E6" }}>
                                <span>Hey! How can I help you today?</span>
                            </div>
                        </div>
                    </div>
                )}
                {activeChatId && messages.length > 0 && (
                    <div className="flex flex-col gap-2 h-full min-h-0 overflow-y-scroll">
                        {messages.map((message: AiChatMessage) => (
                            <AiChatMessageBlock
                                key={message.id}
                                role={message.role}
                                text={message.text}
                                timestamp={message.timestamp}
                            />
                        ))}
                        {loading && (
                            <AiChatMessageBlock
                                role={AiChatMessageRole.ASSISTANT}
                                loading={true}
                            />
                        )}
                    </div>
                )}
                <div className="w-full shrink-0 flex flex-col gap-2 sticky bottom-0 bg-white pt-2">
                    {error && (
                        <Alert variant={AlertVariant.ERROR} text={error.message} />
                    )}
                    {hasReachedMaxMessages && (
                        <div className="text-xs opacity-60 text-center">
                            <span>You have reached the maximum number of messages in this chat. Please start a new chat to continue.</span>
                        </div>
                    )}
                    <AiChatInput
                        disabled={isInputDisabled}
                        key={messages.length}
                        placeholder="Ask anything..."
                        tool={selectedTool}
                        onToolChange={(tool: AiTool) => setSelectedTool(tool)}
                        onSubmit={(prompt: string) => handleMessageSubmit(prompt)}
                    />
                    <div className="text-xs opacity-60 text-center">
                        <span>Folio AI can make mistakes. Check important info.</span>
                    </div>
                </div>
            </Panel.Body>
        </Panel.Content>
    );
};
