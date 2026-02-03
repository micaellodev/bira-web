"use client";

import { useEffect, useState } from "react";
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

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000); // Polling for now
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp/conversations`);
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        }
    };

    return (
        <div className="w-80 border-r border-neutral-800 bg-neutral-900/50 flex flex-col">
            <div className="p-4 border-b border-neutral-800">
                <h2 className="text-xl font-semibold text-white">Chats</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                    <button
                        key={conv.id}
                        onClick={() => onSelect(conv.phoneNumber)}
                        className={`w-full p-4 flex items-start gap-3 hover:bg-neutral-800/50 transition-colors text-left ${selectedId === conv.phoneNumber ? "bg-neutral-800" : ""
                            }`}
                    >
                        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold shrink-0">
                            {conv.name?.[0] || conv.phoneNumber[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                                <span className="font-medium text-white truncate">
                                    {conv.name || conv.phoneNumber}
                                </span>
                                <span className="text-xs text-neutral-500 shrink-0">
                                    {format(new Date(conv.lastMessageAt), "HH:mm")}
                                </span>
                            </div>
                            <p className="text-sm text-neutral-400 truncate">
                                {conv.messages[0]?.type === 'image' ? '📷 Photo' :
                                    conv.messages[0]?.type === 'audio' ? '🎤 Audio' :
                                        conv.messages[0]?.content || "No messages"}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
