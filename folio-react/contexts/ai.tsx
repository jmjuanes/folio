import React from "react";
import { uid } from "uid/secure";
import { useApi } from "../hooks/use-api.ts";
import { promisifyValue } from "../utils/promises.js";

export enum AiChatMessageRole {
    USER = "user",
    ASSISTANT = "assistant",
};

export enum AiTool {
    GENERATE_ELEMENTS = "generateElements",
    GENERATE_DIAGRAM = "generateDiagram",
    GENERATE_SVG = "generateSvg",
};

export type AiChatMessage = {
    id: string;
    role: AiChatMessageRole;
    text?: string;
    elements?: any[];
    timestamp?: string;
    loading?: boolean;
};

export type AiChat = {
    id: string;
    tool: AiTool;
    messages: AiChatMessage[];
    title?: string;
    timestamp?: string;
};

export type AiQuotas = {
    requestsLimit?: number;
    requestsUsed?: number;
    lastRequestDate?: Date;
};

export type AiChatManager = {
    getChats: () => AiChat[];
    clearChats: () => void;
    getChat: (chatId: string) => AiChat | null;
    addChat: (chatData: Partial<AiChat>) => AiChat;
    updateChat: (chatId: string, chatData: Partial<AiChat>) => void;
    removeChat: (chatId: string) => void;
    getMessages: (chatId: string) => AiChatMessage[];
    getMessage: (chatId: string, messageId: string) => AiChatMessage | null;
    addMessage: (chatId: string, messageData: Partial<AiChatMessage>) => AiChatMessage;
    updateMessage: (chatId: string, messageId: string, messageData: Partial<AiChatMessage>) => void;
    removeMessage: (chatId: string, messageId: string) => void;
};

export type AiToolsManager = {
    generateElements: (prompt: string, messages: AiChatMessage[]) => Promise<any>;
};

export type AiManager = {
    chat: AiChatManager;
    tools: AiToolsManager;
    quotas?: AiQuotas;
};

export type AiProviderProps = {
    baseUrl: string;
    chats?: AiChat[];
    onChatChange?: (chats: AiChat[]) => void;
    children: React.ReactNode,
};

// export ai context to
export const AiContext = React.createContext<AiManager | null>(null);

// export hook to access to the ai manager
export const useAi = (): AiManager | null => {
    return React.useContext(AiContext);
};

export const AiProvider = (props: AiProviderProps): React.JSX.Element => {
    const [chatState, setChatState] = React.useState<AiChat[] | null>(null);
    const quotas = React.useRef<AiQuotas>({ requestsUsed: 0 });
    const api = useApi(props.baseUrl);

    // create the api manager
    const manager = React.useMemo<AiManager>(() => {
        const chatManager = {
            getChats: () => {
                return chatState || [];
            },
            clearChats: () => {
                setChatState([]);
            },
            getChat: (chatId: string) => {
                return chatState?.find((chat: AiChat) => chat.id === chatId) || null;
            },
            addChat: (chatData: Partial<AiChat> = {}) => {
                const newChatItem = {
                    id: uid(20),
                    messages: [],
                    timestamp: new Date().toISOString(),
                    title: "Untitled Chat",
                    tool: AiTool.GENERATE_ELEMENTS,
                    ...chatData,
                } as AiChat;
                setChatState((prevState: AiChat[] | null) => {
                    return [...(prevState || []), newChatItem];
                });
                // return the new chat item
                return newChatItem;
            },
            updateChat: (chatId: string, chatData: Partial<AiChat>) => {
                setChatState((prevState: AiChat[] | null) => {
                    return prevState?.map((chat: AiChat) => {
                        return chat.id === chatId ? Object.assign(chat, chatData) : chat;
                    }) || [];
                });
            },
            removeChat: (chatId: string) => {
                setChatState((prevState: AiChat[] | null) => {
                    return prevState?.filter((chat: AiChat) => chat.id !== chatId) || [];
                });
            },
            getMessages: (chatId: string) => {
                return (chatState || []).find((chat: AiChat) => chat.id === chatId)?.messages || [];
            },
            getMessage: (chatId: string, messageId: string) => {
                return chatManager.getMessages(chatId).find((message: AiChatMessage) => message.id === messageId) || null;
            },
            addMessage: (chatId: string, messageData: Partial<AiChatMessage>) => {
                const newChatMessage: AiChatMessage = {
                    id: uid(20),
                    timestamp: new Date().toISOString(),
                    role: AiChatMessageRole.USER,
                    ...messageData,
                };
                setChatState((prevState: AiChat[] | null) => {
                    return prevState?.map((chat: AiChat) => {
                        if (chat.id === chatId) {
                            chat.messages.push(newChatMessage);
                        }
                        return chat;
                    }) || [];
                });
                // return the new chat message
                return newChatMessage;
            },
            updateMessage: (chatId: string, messageId: string, messageData: Partial<AiChatMessage>) => {
                setChatState((prevState: AiChat[] | null) => {
                    return prevState?.map((chat: AiChat) => {
                        if (chat.id === chatId) {
                            chat.messages = chat.messages.map((message: AiChatMessage) => {
                                return message.id === messageId ? Object.assign({}, message, messageData) : message;
                            });
                        }
                        return chat;
                    }) || [];
                });
            },
            removeMessage: (chatId: string, messageId: string) => {
                setChatState((prevState: AiChat[] | null) => {
                    return prevState?.map((chat: AiChat) => {
                        if (chat.id === chatId) {
                            chat.messages = chat.messages.filter((message: AiChatMessage) => message.id !== messageId);
                        }
                        return chat;
                    }) || [];
                });
            },
        } as AiChatManager;
        const toolsManager = {
            generateElements: (prompt: string, messages: AiChatMessage[]) => {
                // const validMessages = (messages || []).filter(message => !message.loading);
                // 1. update the requests performed to the server
                quotas.current.lastRequestDate = new Date(); // update last request date
                quotas.current.requestsUsed = quotas.current.requestsUsed + 1; // increment requests count
                // 2. perform the request to the ai service
                return api("POST", "/generateElements", {
                    prompt: prompt,
                    messages: messages.map((message: AiChatMessage) => {
                        return {
                            role: message.role,
                            text: message.text,
                            elements: message.elements,
                        };
                    }),
                });
                // 3. return the data object
                // return data;
            },
        } as AiToolsManager;
        return {
            chat: chatManager,
            tools: toolsManager,
            quotas: quotas.current,
        } as AiManager;
    }, [chatState]);

    // on init, import chat data
    React.useEffect(() => {
        promisifyValue(props.chats)
            .then((chats: AiChat[]) => {
                setChatState(chats || []);
            })
            .catch((error: Error) => {
                console.error("Error loading chats:", error);
                setChatState([]); // initialize as empty chats
            });
    }, []);

    // when a change in the chats is performed, use the useEffect hook to dispatch a chat change
    React.useEffect(() => {
        if (!!chatState && typeof props.onChatChange === "function") {
            props.onChatChange(chatState);
        }
    }, [chatState]);

    // when the baseurl changes, perform a request to status endpoint to update quotas
    React.useEffect(() => {
        if (props.baseUrl) {
            quotas.current.lastRequestDate = new Date();
            api("GET", "/status").then((response: any) => {
                if (typeof response.requestsLimit === "number" && response.requestsLimit >= 0) {
                    quotas.current.requestsLimit = response.requestsLimit;
                    quotas.current.requestsUsed = response.requestsUsed ?? 0;
                }
            });
        }
    }, [props.baseUrl]);

    return (
        <AiContext.Provider value={manager}>
            {props.children}
        </AiContext.Provider>
    );
};
