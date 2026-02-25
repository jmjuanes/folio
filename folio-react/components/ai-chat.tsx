import React from "react";
import { PlusIcon, ChevronLeftIcon } from "@josemi-icons/react";
import { renderIcon } from "@josemi-icons/react";
import classNames from "classnames";
import { useAi } from "../contexts/ai.tsx";
import { useEditor } from "../contexts/editor.jsx";
import { ELEMENTS } from "../constants.js";

export type AiChatHeaderTitleProps = {
    title: string;
    showBackButton: boolean;
    onBackButtonClick?: () => void;
};

export const AiChatHeaderTitle = (props: AiChatHeaderTitleProps): React.JSX.Element => (
    <div className="flex items-center gap-2 w-full">
        {props.showBackButton && (
            <div className="flex items-center text-xl cursor-pointer p-1 rounded-lg hover:bg-gray-100" onClick={props.onBackButtonClick}>
                <ChevronLeftIcon />
            </div>
        )}
        <div className="font-bold text-lg w-32 truncate">
            <span>{props.title}</span>
        </div>
    </div>
);

export type AiChatHeaderButtonProps = {
    icon: string;
    disabled?: boolean;
    onClick?: () => void;
};

export const AiChatHeaderButton = (props: AiChatHeaderButtonProps): React.JSX.Element => {
    const className = classNames({
        "flex items-center p-2 rounded-lg": true,
        "bg-gray-100 hover:bg-gray-200 cursor-pointer": true,
    });
    return (
        <div className={className} onClick={props.onClick}>
            {renderIcon(props.icon)}
        </div>
    );
};

export const AiChat = () => {
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
        <div className="flex flex-col gap-2 h-full min-h-0 pb-2">
            <div className="sticky top-0 bg-white flex items-center justify-between pb-2 z-20">
                {!activeChatId && (
                    <React.Fragment>
                        <AiChatHeaderTitle
                            showBackButton={false}
                            title="AI Assistant"
                        />
                        <div className="flex items-center gap-1">
                            <AiChatHeaderButton
                                icon="plus"
                                disabled={false}
                                onClick={handleChatCreate}
                            />
                            <AiChatHeaderButton
                                icon="trash"
                                disabled={false}
                                onClick={() => ai?.chat.clearChats()}
                            />
                        </div>
                    </React.Fragment>
                )}
                {activeChatId && (
                    <React.Fragment>
                        <AiChatHeaderTitle
                            showBackButton={true}
                            title={activeChat?.title || "Untitled Chat"}
                            onBackButtonClick={() => setActiveChatId("")}
                        />
                        <div className="flex items-center gap-1">
                            <AiChatHeaderButton
                                icon="trash"
                                disabled={false}
                                onClick={() => ai?.chat.removeChat(activeChatId)}
                            />
                        </div>
                    </React.Fragment>
                )}
            </div>
            {activeChatId && (
                <div className="grow flex flex-col justify-between gap-4 h-full">
                    <div className="h-full overflow-y-scroll">
                        <span>Messages</span>
                    </div>
                    <div className="w-full shrink-0 pb-2">
                        <textarea
                            placeholder="Type your message..."
                            className="w-full border-0 bg-gray-100 rounded-lg text-sm outline-none"
                            rows={4}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
