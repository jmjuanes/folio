import React from "react";
import classNames from "classnames";
import { uid } from "uid/secure";
import { renderIcon, SparklesIcon } from "@josemi-icons/react";
import { PREFERENCES } from "../constants.js";
import { Ai } from "./ui/ai.tsx";
import { Alert, AlertVariant } from "./ui/alert.tsx";
import { Dropdown, DropdownPortalPosition } from "./ui/dropdown.tsx";
import { Panel } from "./ui/panel.tsx";
import { useAi, AiChatMessageRole, AiTool, AiChatMessageType } from "../contexts/ai.tsx";
import type { AiChatMessage } from "../contexts/ai.tsx";
import { usePreferences } from "../contexts/preferences.tsx";
import { useEditor } from "../contexts/editor.tsx";
import { useConfirm } from "../contexts/confirm.jsx";
import { useElementsPreview } from "../hooks/use-preview.ts";
import { parseElementsFromAiResponse } from "../lib/ai.ts";
import { isSameDay } from "../utils/dates.ts";
import { copyTextToClipboard } from "../utils/clipboard.js";

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
    text?: string;
    onClick?: () => void;
};

const AiChatMessageActionButton = (props: AiChatMessageActionButtonProps): React.JSX.Element => (
    <div className="flex items-center justify-center gap-1 hover:bg-gray-100 rounded-lg p-1 cursor-pointer" onClick={props.onClick}>
        <div className="flex text-lg opacity-60">
            {renderIcon(props.icon)}
        </div>
        {!!props.text && (
            <div className="text-sm opacity-60">{props.text}</div>
        )}
    </div>
);

type AiChatAssistantMessageProps = {
    type: AiChatMessageType;
    content: any;
    onDeleteMessage?: () => void;
};

const AiChatAssistantMessage = (props: AiChatAssistantMessageProps): React.JSX.Element => {
    const editor = useEditor();

    const elements = React.useMemo(() => {
        if (props.type === AiChatMessageType.ELEMENTS) {
            return parseElementsFromAiResponse(props.content || []);
        }
        return [];
    }, [props.type, props.content?.length]);

    // generate the preview based on the processed elements
    const previewImage: string | null = useElementsPreview({ elements, width: 200, height: 200 });

    // when the insert button is pressed, import the generated elements into the editor board
    const handleInsertClick = React.useCallback(() => {
        editor.importElements(elements, null, null, uid(20));
        editor.update();
        editor.dispatchChange();
    }, [elements, editor]);

    return (
        <div className="flex flex-col gap-2">
            {props.type === AiChatMessageType.TEXT && props.content && (
                <div className="text-sm text-gray-950">{props.content}</div>
            )}
            {props.type === AiChatMessageType.ELEMENTS && elements.length > 0 && (
                <div className="flex items-center justify-center w-72 rounded-xl border-1 border-gray-200 p-1">
                    {!!previewImage && (
                        <img src={previewImage} width="100%" height="100%" />
                    )}
                    {!previewImage && (
                        <div className="flex text-4xl animate-pulse text-gray-600">
                            {renderIcon("dots")}
                        </div>
                    )}
                </div>
            )}
            {props.type === AiChatMessageType.ELEMENTS && elements.length > 0 && !!previewImage && (
                <div className="flex items-center gap-1">
                    <AiChatMessageActionButton icon="arrow-up-left" text="Insert" onClick={handleInsertClick} />
                    <AiChatMessageActionButton icon="trash" onClick={props.onDeleteMessage} />
                </div>
            )}
        </div>
    );
};

type AiChatConversationProps = {
    messages: AiChatMessage[];
    loading: boolean;
};

const AiChatConversation = (props: AiChatConversationProps): React.JSX.Element => (
    <Ai.Conversation scrollToEnd={true}>
        {props.messages.map((message: AiChatMessage) => {
            const messageContentClassName = classNames({
                "bg-gray-100 px-4 py-3 rounded-xl": message.role === AiChatMessageRole.USER,
            });
            return (
                <Ai.Message key={message.id} role={message.role}>
                    {message.type === AiChatMessageType.TEXT && (
                        <Ai.MessageContent className={messageContentClassName}>
                            <span>{message.content}</span>
                        </Ai.MessageContent>
                    )}
                </Ai.Message>
            );
        })}
        {props.loading && (
            <div className="flex text-2xl animate-pulse text-gray-600">
                {renderIcon("dots")}
            </div>
        )}
    </Ai.Conversation> 
);

export const AiChat = (): React.JSX.Element => {
    const [prompt, setPrompt] = React.useState<string>("");
    const [activeChatId, setActiveChatId] = React.useState<string>("");
    const [selectedTool, setSelectedTool] = React.useState<AiTool>(AiTool.GENERATE_ELEMENTS);
    const [loading, setLoading] = React.useState<Boolean>(false);
    const [error, setError] = React.useState<Error | null>(null);
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
        ai?.chat.addMessage(currentChatId, {
            role: AiChatMessageRole.USER,
            type: AiChatMessageType.TEXT,
            content: prompt,
        });
        // 3. call the tool
        callTool(prompt)
            .then((response: any) => {
                // 3.1. add assistant messages to the current chat (one for each part)
                (response?.parts || []).forEach((part: any) => {
                    ai?.chat.addMessage(currentChatId, {
                        role: AiChatMessageRole.ASSISTANT,
                        type: part.type,
                        content: part.content,
                    });
                });
                // 3.2. if a text is sent in the response, update the chat title
                // to set the first response as the title
                if (response?.title) {
                    ai?.chat.updateChat(currentChatId, {
                        title: response?.title,
                    });
                }
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
            if (message && message.type === AiChatMessageType.TEXT) {
                copyTextToClipboard(message.content);
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
        // note that the requests comparison must be performed only if the lastRequestDate is in the same 
        // day as today
        if (typeof ai?.quotas?.requestsLimit === "number" && ai?.quotas?.requestsUsed) {
            if (isSameDay(ai.quotas?.lastRequestDate || new Date(), new Date())) {
                return !(ai.quotas.requestsUsed < ai.quotas.requestsLimit);
            }
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
                    <AiChatConversation
                        key={`ai:conversation:${messages.length}`} 
                        messages={messages}
                        loading={!!loading}
                    />
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
                    <Ai.Prompt>
                        <Ai.PromptInput
                            key={messages.length}
                            disabled={isInputDisabled}
                            placeholder="Ask anything..."
                            rows={3}
                            onChange={value => setPrompt(value)}
                        />
                        <div className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <Ai.PromptButton icon="image" text="Upload image" />
                            </div>
                            <Ai.PromptSubmit
                                disabled={isInputDisabled}
                            />
                        </div>
                    </Ai.Prompt>
                    <div className="text-xs opacity-60 text-center">
                        <span>Folio AI can make mistakes. Check important info.</span>
                    </div>
                    {!!ai && typeof ai?.quotas?.requestsLimit === "number" && typeof ai?.quotas?.requestsUsed === "number" && (
                        <Ai.Context
                            maxRequests={ai.quotas.requestsLimit}
                            usedRequests={ai.quotas.requestsUsed}
                        />
                    )}
                </div>
            </Panel.Body>
        </Panel.Content>
    );
};
