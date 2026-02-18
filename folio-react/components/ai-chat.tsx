import React from "react";
import { Panel } from "./ui/panel.tsx";
import { Island } from "./ui/island.jsx";
import { useAI } from "../contexts/ai.tsx";
import { useEditor } from "../contexts/editor.jsx";
import { ELEMENTS } from "../constants.js";

export const AiChat = () => {
    const { messages, sendMessage } = useAI();
    const editor = useEditor();
    const [input, setInput] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const handleSend = async () => {
        if (input.trim() && !loading) {
            setLoading(true);
            const message = input;
            setInput("");
            await sendMessage(message);
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100">
                <div className="text-lg font-bold">AI Assistant</div>
                <div className="text-sm text-gray-500">Ask anything about your whiteboard</div>
            </div>
            <div ref={scrollRef} className="grow overflow-y-auto p-4 flex flex-col gap-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        No messages yet. Start a conversation!
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`max-w-[85%] p-3 rounded-xl ${msg.role === "user"
                            ? "bg-blue-600 text-white self-end rounded-tr-none"
                            : "bg-gray-100 text-gray-800 self-start rounded-tl-none"
                            }`}
                    >
                        <div className="text-xs opacity-70 mb-1 uppercase font-bold tracking-wider">
                            {msg.role === "user" ? "You" : "AI"}
                        </div>
                        <div className="text-sm break-words whitespace-pre-wrap">
                            {msg.content}
                        </div>
                        {msg.elements && msg.elements.length > 0 && (
                            <div className="mt-3 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <div className="text-[10px] uppercase font-bold text-gray-400 mb-2 border-b border-gray-100 pb-1">Generated Elements ({msg.elements.length})</div>
                                <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto mb-2">
                                    {msg.elements.map((el, index) => (
                                        <div key={index} className="text-[10px] text-gray-600 flex justify-between items-center bg-gray-50 p-1 rounded">
                                            <span className="font-semibold mr-2">{el.type}</span>
                                            <div className="flex gap-2 truncate text-right">
                                                {el.type === "text" && <span className="truncate max-w-[100px] text-gray-400">"{el.text}"</span>}
                                                {el.type === "shape" && (
                                                    <>
                                                        <span className="text-gray-400">{el.shape}</span>
                                                        {el.text && <span className="truncate max-w-[50px] text-gray-300">"{el.text}"</span>}
                                                    </>
                                                )}
                                                {el.type === "note" && <span className="truncate max-w-[100px] text-gray-400">"{el.noteText}"</span>}
                                                {el.type === "sticker" && <span className="text-2xl">{el.sticker}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => editor.importElements(msg.elements!)}
                                    className="w-full py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-md hover:bg-blue-700 transition-colors uppercase tracking-wider"
                                >
                                    Insert to Board
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="bg-gray-100 text-gray-800 self-start p-3 rounded-xl rounded-tl-none animate-pulse">
                        <div className="text-xs opacity-70 mb-1 uppercase font-bold tracking-wider">AI</div>
                        <div className="text-sm">Thinking...</div>
                    </div>
                )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="grow p-2 bg-white border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] max-h-[120px]"
                        rows={1}
                    />
                    <Island.Button
                        icon="send"
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="shrink-0 h-10 w-10 !p-0 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700"
                    />
                </div>
            </div>
        </div>
    );
};
