import React from "react";
import classNames from "classnames";
import { ArrowUpIcon } from "@josemi-icons/react";
import { Panel } from "./ui/panel.tsx";
import { useAi } from "../contexts/ai.tsx";
import { useEditor } from "../contexts/editor.jsx";

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
        <div className="bg-gray-100 rounded-lg border-0 p-1">
            <textarea
                ref={inputRef}
                disabled={!!props.disabled}
                placeholder={props.placeholder}
                rows={props?.inputRows ?? 4}
                className="text-sm bg-transparent outline-none border-0 w-full min-h-24"
            />
            <div className="flex items-center justify-end">
                <button className="border-0 bg-gray-950 hover:bg-gray-900 cursor-pointer text-white flex rounded-full p-1" onClick={handleSubmit}>
                    <ArrowUpIcon />
                </button>
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

    const handleChatCreate = React.useCallback(() => {
        const chat = ai?.chat.addChat({});
        if (chat) {
            setActiveChatId(chat.id);
        }
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
                    <div className="h-full overflow-y-scroll">
                        <span>Messages</span>
                    </div>
                    <div className="w-full shrink-0">
                        <AiChatInput
                            placeholder="Ask anything..."
                            onSubmit={(prompt: string) => {
                                console.log(prompt);
                            }}
                        />
                    </div>
                </Panel.Body>
            )}
        </Panel.Content>
    );
};
