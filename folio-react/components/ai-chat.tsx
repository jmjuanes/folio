import React from "react";
import classNames from "classnames";
import { renderIcon } from "@josemi-icons/react";
import { Panel } from "./ui/panel.tsx";
import { useAi } from "../contexts/ai.tsx";
import { useEditor } from "../contexts/editor.jsx";
import { AiChatMessageRole, AiChatMessage } from "../contexts/ai.tsx";

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
        props.onSubmit(inputRef.current?.value || "");
    }, [props.onSubmit]);

    return (
        <div className="bg-gray-100 rounded-lg border-0 p-2">
            <textarea
                ref={inputRef}
                disabled={!!props.disabled}
                placeholder={props.placeholder}
                rows={props?.inputRows ?? 4}
                className="text-sm bg-transparent outline-none border-0 w-full min-h-24 p-0"
            />
            <div className="flex items-center justify-end">
                <AiChatButton icon="send" onClick={handleSubmit} />
            </div>
        </div>
    );
};

type AiChatMessageBlockProps = {
    role: AiChatMessageRole;
    text?: string;
};

const AiChatMessageBlock = (props: AiChatMessageBlockProps): React.JSX.Element => {
    const containerClassName = classNames({
        "flex w-full items-start": true,
        "justify-start": props.role === AiChatMessageRole.ASSISTANT,
        "justify-end": props.role === AiChatMessageRole.USER,
    });
    const messageClassName = classNames({
        "p-2 max-w-64 text-sm": true,
        "bg-gray-100 text-gray-950": props.role === AiChatMessageRole.ASSISTANT,
        "bg-gray-950 text-white": props.role === AiChatMessageRole.USER,
    });
    return (
        <div className={containerClassName}>
            <div className={messageClassName}>
                <span>{props.text || ""}</span>
            </div>
        </div>
    );
};

export const AiChat = (): React.JSX.Element => {
    const [activeChatId, setActiveChatId] = React.useState<string>("");
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const ai = useAi();
    const editor = useEditor();

    // get active chat instance
    const activeChat = activeChatId ? ai?.chat.getChat(activeChatId) : null;
    const messages = ai?.chat.getMessages(activeChatId) || [];

    const handleChatCreate = React.useCallback(() => {
        const chat = ai?.chat.addChat({});
        setActiveChatId(chat.id);
    }, [ai]);

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
                            title="AI Assistant"
                        />
                        <div className="flex items-center gap-1">
                            <Panel.HeaderButton
                                icon="plus"
                                disabled={false}
                                onClick={handleChatCreate}
                            />
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
            {activeChatId && (
                <Panel.Body className="grow flex flex-col justify-between gap-4 h-full">
                    <div className="flex flex-col gap-2 h-full overflow-y-scroll">
                        {messages.map((message: AiChatMessage) => (
                            <AiChatMessageBlock
                                key={message.id}
                                role={message.role}
                                text={message.text}
                            />
                        ))}
                    </div>
                    <div className="w-full shrink-0">
                        <AiChatInput
                            key={messages.length}
                            placeholder="Ask anything..."
                            onSubmit={(prompt: string) => {
                                // console.log(prompt);
                                ai.chat.addMessage(activeChatId, { text: prompt });
                            }}
                        />
                    </div>
                </Panel.Body>
            )}
        </Panel.Content>
    );
};
