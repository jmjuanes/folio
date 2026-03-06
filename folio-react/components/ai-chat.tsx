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
import { useConfirm } from "../contexts/confirm.jsx";
import { formatDate } from "../utils/dates.ts";
import { copyTextToClipboard } from "../utils/clipboard.js";
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
    onCopyMessage?: () => void;
    onDeleteMessage?: () => void;
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
                        <div className="flex text-2xl animate-pulse text-gray-600">
                            {renderIcon("dots")}
                        </div>
                    )}
                </div>
                {!props.loading && (
                    <div className={actionsClassName}>
                        {typeof props.onCopyMessage === "function" && (
                            <AiChatMessageActionButton icon="copy" onClick={props.onCopyMessage} />
                        )}
                        {typeof props.onDeleteMessage === "function" && (
                            <AiChatMessageActionButton icon="trash" onClick={props.onDeleteMessage} />
                        )}
                    </div>
                )}
            </div>
            {props.role === AiChatMessageRole.USER && props.timestamp && (
                <div className="flex items-center justify-end">
                    <span className="text-3xs opacity-60">{formatDate(props.timestamp)}</span>
                </div>
            )}
        </div>
    );
};

type AiChatQuotasProps = {
    requestsLimit: number;
    requestsUsed: number;
};

const AiChatQuotas = (props: AiChatQuotasProps): React.JSX.Element | null => {
    if (props.requestsUsed > 0) {
        const completed = props.requestsUsed / props.requestsLimit;
        return (
            <div className="flex flex-col items-center gap-1">
                <div className="flex h-2 rounded-full w-full bg-gray-100 overflow-hidden">
                    <div className="bg-gray-950 h-2" style={{ width: `${100 * completed}%` }} />
                </div>
                <div className="text-xs opacity-80 text-center">
                    <span className="font-bold">{props.requestsLimit - props.requestsUsed}</span>
                    <span> requests left today.</span>
                </div>
            </div>
        );
    }
    return null;
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
    const { showConfirm } = useConfirm();

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

    // remove a message from the chat
    const handleMessageRemove = React.useCallback((messageId: string) => {
        if (activeChatId) {
            ai?.chat.removeMessage(activeChatId, messageId);
            // check if the last message was removed
            if (messages?.length === 1 && messages[0].id === messageId) {
                ai?.chat.removeChat(activeChatId);
                setActiveChatId("");
            }
        }
    }, [ai, activeChatId, messages?.length]);

    // copy message to clipboard
    const handleMessageCopy = React.useCallback((messageId: string) => {
        if (activeChatId) {
            const message = ai?.chat.getMessage(activeChatId, messageId);
            if (message) {
                copyTextToClipboard(message.text);
            }
        }
    }, [ai, activeChatId]);

    // clear chats
    const handleClearChats = React.useCallback(() => {
        showConfirm({
            title: "Clear chat history",
            message: "Are you sure you want to clear all chats? This will remove all conversations and cannot be undone.",
            confirmText: "Clear all chats",
            onSubmit: () => {
                ai?.chat.clearChats();
                setActiveChatId("");
            },
        });
    }, [ai, activeChatId, showConfirm]);

    // clear current chat
    const handleClearCurrentChat = React.useCallback(() => {
        if (activeChatId) {
            showConfirm({
                title: "Clear chat",
                message: "Are you sure you want to clear this chat? This will remove all messages and cannot be undone.",
                confirmText: "Clear chat",
                onSubmit: () => {
                    ai?.chat.removeChat(activeChatId);
                    setActiveChatId("");
                },
            });
        }
    }, [ai, activeChatId, showConfirm]);

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
        // 4. check if the quotas has been reached
        if (typeof ai?.quotas?.requestsLimit === "number" && ai?.quotas?.requestsUsed) {
            return !(ai.quotas.requestsUsed < ai.quotas.requestsLimit);
        }
        // input is not disabled
        return false;
    }, [ai, ai?.quotas?.requestsLimit, ai?.quotas?.requestsUsed, loading, hasReachedMaxMessages]);

    return (
        <Panel.Content>
            <Panel.Header>
                <Panel.HeaderTitle
                    showBackButton={!!activeChatId}
                    title={activeChatId ? (activeChat?.title || "Untitled Chat") : "Folio AI"}
                    onBackButtonClick={() => setActiveChatId("")}
                />
                <div className="flex items-center gap-1">
                    {activeChatId && (
                        <Panel.HeaderButton
                            icon="plus"
                            onClick={() => setActiveChatId("")}
                        />
                    )}
                    {activeChatId && (
                        <Panel.HeaderButton
                            icon="trash"
                            onClick={() => handleClearCurrentChat()}
                        />
                    )}
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
                                <Dropdown.Item onClick={() => handleClearChats()}>
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
                                onDeleteMessage={() => handleMessageRemove(message.id)}
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
                    {!!ai && typeof ai?.quotas?.requestsLimit === "number" && typeof ai?.quotas?.requestsUsed === "number" && (
                        <AiChatQuotas
                            requestsLimit={ai.quotas.requestsLimit}
                            requestsUsed={ai.quotas.requestsUsed}
                        />
                    )}
                </div>
            </Panel.Body>
        </Panel.Content>
    );
};
