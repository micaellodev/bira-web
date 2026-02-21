"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";

type Conversation = {
    id: number;
    phoneNumber: string;
    name: string | null;
    lastMessageAt: string;
    messages: {
        content: string | null;
        type: string;
        createdAt: string;
    }[];
};

export default function ChatList({
    onSelect,
    selectedId,
}: {
    onSelect: (phoneNumber: string) => void;
    selectedId: string | null;
}) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const prevConversationsRef = useRef<Conversation[]>([]);

    useEffect(() => {
        // Request notification permissions
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        fetchConversations();
        const interval = setInterval(fetchConversations, 5000); // Polling for now
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp/conversations`);
            if (res.ok) {
                const data: Conversation[] = await res.json();

                // Track new messages to alert
                if (prevConversationsRef.current.length > 0) {
                    data.forEach(newConv => {
                        const oldConv = prevConversationsRef.current.find(c => c.id === newConv.id);

                        // If it's a completely new conversation, or the lastMessageAt has changed
                        if (!oldConv || new Date(newConv.lastMessageAt).getTime() > new Date(oldConv.lastMessageAt).getTime()) {
                            // Only notify if the last message is inbound (from the customer)
                            const lastMessage = newConv.messages[0];
                            // Note: backend might need to return direction in the messages array for this check
                            // but usually newly bumped active chats are from the user. We'll show a generic one if direction isn't there
                            if (lastMessage) {
                                if ("Notification" in window && Notification.permission === "granted") {
                                    const title = `Mensaje de ${newConv.name || newConv.phoneNumber}`;
                                    let body = lastMessage.content || "Nuevo mensaje multimedia";

                                    if (lastMessage.type === 'image') body = '📷 Foto';
                                    if (lastMessage.type === 'audio') body = '🎤 Audio';
                                    if (lastMessage.type === 'video') body = '🎥 Video';
                                    if (lastMessage.type === 'document') body = '📄 Documento';

                                    new Notification(title, {
                                        body: body,
                                        icon: '/logo.png' // Adjust to path of your site icon if needed
                                    });
                                }
                            }
                        }
                    });
                }

                prevConversationsRef.current = data;
                setConversations(data);
            }
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        }
    };

    return (
        <div className="w-80 border-r border-neutral-800/60 bg-neutral-950/80 backdrop-blur-md flex flex-col shadow-xl z-10 transition-all duration-300">
            <div className="p-5 border-b border-neutral-800/60 bg-gradient-to-r from-neutral-900 to-neutral-950 sticky top-0 z-20">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">Chats</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-3 p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-neutral-900/50 flex items-center justify-center mb-2">
                            <span className="text-2xl opacity-50">📭</span>
                        </div>
                        <p className="text-sm">No hay conversaciones</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {conversations.map((conv) => {
                            const isSelected = selectedId === conv.phoneNumber;
                            const lastMessage = conv.messages[0];
                            const initials = (conv.name?.[0] || conv.phoneNumber[0]).toUpperCase();

                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => onSelect(conv.phoneNumber)}
                                    className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all duration-200 text-left group
                                        ${isSelected
                                            ? "bg-gradient-to-r from-teal-900/40 to-teal-800/10 border-l-2 border-teal-500 shadow-sm"
                                            : "hover:bg-neutral-800/40 border-l-2 border-transparent"
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-inner transition-transform duration-300 group-hover:scale-105
                                        ${isSelected ? "bg-gradient-to-br from-teal-500 to-teal-700 shadow-teal-900/50" : "bg-gradient-to-br from-neutral-700 to-neutral-800"}
                                    `}>
                                        {initials}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-1">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className={`font-semibold truncate tracking-tight transition-colors ${isSelected ? "text-white" : "text-neutral-200"}`}>
                                                {conv.name || conv.phoneNumber}
                                            </span>
                                            <span className={`text-[11px] shrink-0 font-medium ${isSelected ? "text-teal-400" : "text-neutral-500"}`}>
                                                {format(new Date(conv.lastMessageAt), "HH:mm")}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate transition-colors ${isSelected ? "text-teal-100/70" : "text-neutral-400"}`}>
                                            {lastMessage?.type === 'image' ? '📷 Foto' :
                                                lastMessage?.type === 'audio' ? '🎤 Audio' :
                                                    lastMessage?.type === 'video' ? '🎥 Video' :
                                                        lastMessage?.type === 'document' ? '📄 Documento' :
                                                            lastMessage?.content || "Nuevo mensaje"}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
