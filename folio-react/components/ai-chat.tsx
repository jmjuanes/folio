import React from "react";
import classNames from "classnames";
import { renderIcon, SparklesIcon } from "@josemi-icons/react";
import { Alert, AlertVariant } from "./ui/alert.tsx";
import { Panel } from "./ui/panel.tsx";
import { useAi, AiChatMessageRole, AiTool } from "../contexts/ai.tsx";
import { useEditor } from "../contexts/editor.jsx";
import type { AiChatMessage } from "../contexts/ai.tsx";

const tools = [
    {
        id: AiTool.GENERATE_ELEMENTS,
        title: "Generate Folio Elements",
        description: "Create a new drawing using folio native elements.",
    },
];

type AiChatButtonProps = {
    icon: string;
    onClick: () => void;
};

const AiChatButton = (props: AiChatButtonProps): React.JSX.Element => {
    const buttonClassName = classNames({
        "border-0 flex items-center rounded-full p-2 text-lg": true,
        "bg-gray-950 hover:bg-gray-900 text-white cursor-pointer": true,
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
            <div className="flex items-center justify-end">
                <AiChatButton icon="arrow-up" onClick={handleSubmit} />
            </div>
        </div>
    );
};

type AiChatMessageBlockProps = {
    role: AiChatMessageRole;
    text?: string;
    elements?: any;
    loading?: boolean;
};

const AiChatMessageBlock = (props: AiChatMessageBlockProps): React.JSX.Element => {
    const containerClassName = classNames({
        "flex w-full items-start": true,
        "justify-start": props.role === AiChatMessageRole.ASSISTANT,
        "justify-end": props.role === AiChatMessageRole.USER,
    });
    const messageClassName = classNames({
        "p-4 max-w-64 flex flex-col gap-1 rounded-lg": true,
        "bg-gray-100 text-gray-950 rounded-tl-none": props.role === AiChatMessageRole.ASSISTANT,
        "bg-gray-950 text-white rounded-tr-none": props.role === AiChatMessageRole.USER,
    });
    return (
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
        </div>
    );
};

export const AiChat = (): React.JSX.Element => {
    const [activeChatId, setActiveChatId] = React.useState<string>("");
    const [loading, setLoading] = React.useState<Boolean>(false);
    const [error, setError] = React.useState<Error | null>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const ai = useAi();
    const editor = useEditor();

    // get active chat instance
    const activeChat = activeChatId ? ai?.chat.getChat(activeChatId) : null;
    const messages = ai?.chat.getMessages(activeChatId) || [];

    const handleChatCreate = React.useCallback((chatType: AiChatType) => {
        const chat = ai?.chat.addChat({ type: chatType });
        setActiveChatId(chat?.id || "");
    }, [ai]);

    // run the appropiate model based on the chat type
    const callModel = React.useCallback((prompt: string): Promise<any> => {
        if (ai) {
            return ai?.model.generateElements(prompt, messages);
        }
        return Promise.reject(new Error("AI is not configured"));
    }, [ai, activeChatId, messages?.length]);

    // when the user types and sends a message, we have to register the message
    // and call the completion
    const handleMessageSubmit = React.useCallback((prompt: string) => {
        setLoading(true);
        setError(null);
        ai?.chat.addMessage(activeChatId, { text: prompt });
        callModel(prompt)
            .then((response: any) => {
                ai?.chat.addMessage(activeChatId, {
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
    }, [ai, activeChatId, callModel]);

    React.useEffect(() => {
        if (scrollRef.current && activeChatId) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeChatId]);

    return (
        <Panel.Content>
            <Panel.Header>
                {!activeChatId && (
                    <React.Fragment>
                        <Panel.HeaderTitle
                            showBackButton={false}
                            title="Folio AI"
                        />
                        <div className="flex items-center gap-1">
                            <Panel.HeaderButton
                                icon="trash"
                                disabled={false}
                                onClick={() => ai?.chat.clearChats()}
                            />
                        </div>
                    </React.Fragment>
                )}
                {activeChatId && (
                    <React.Fragment>
                        <Panel.HeaderTitle
                            showBackButton={true}
                            title={activeChat?.title || "Untitled Chat"}
                            onBackButtonClick={() => setActiveChatId("")}
                        />
                        <div className="flex items-center gap-1">
                            <Panel.HeaderButton
                                icon="trash"
                                disabled={false}
                                onClick={() => ai?.chat.removeChat(activeChatId)}
                            />
                        </div>
                    </React.Fragment>
                )}
            </Panel.Header>
            <Panel.Body className="grow flex flex-col justify-between gap-4 h-full">
                {(!activeChatId || messages?.length === 0) && (
                    <div className="flex flex-col items-center justify-center gap-4 h-full">
                        <div className="flex flex-col items-center gap-4 px-10 py-0">
                            <div className="flex items-center text-4xl p-3 rounded-full text-white" style={{ background: "linear-gradient(60deg, #4A74E6, #8D54E9)" }}>
                                <SparklesIcon />
                            </div>
                            <div className="text-3xl font-bold text-center leading-tight">
                                <span>How can I help you today?</span>
                            </div>
                        </div>
                    </div>
                )}
                {activeChatId && messages.length > 0 && (
                    <div className="flex flex-col gap-2 h-full overflow-y-scroll">
                        {messages.map((message: AiChatMessage) => (
                            <AiChatMessageBlock
                                key={message.id}
                                role={message.role}
                                text={message.text}
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
                <div className="w-full shrink-0 flex flex-col gap-2">
                    {error && (
                        <Alert variant={AlertVariant.ERROR} text={error.message} />
                    )}
                    <AiChatInput
                        key={messages.length}
                        placeholder="Ask anything..."
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
