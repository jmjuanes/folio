import React from "react";
import classNames from "classnames";
import { Panel } from "./ui/panel.tsx";
import { useAi } from "../contexts/ai.tsx";
import { useEditor } from "../contexts/editor.jsx";
import { ELEMENTS } from "../constants.js";

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
                        <textarea
                            placeholder="Type your message..."
                            className="w-full border-0 bg-gray-100 rounded-lg text-sm outline-none min-h-24"
                            rows={4}
                        />
                    </div>
                </Panel.Body>
            )}
        </Panel.Content>
    );
};
