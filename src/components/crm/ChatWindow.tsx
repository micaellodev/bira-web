"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { Send, Image as ImageIcon, Mic, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import NextImage from "next/image";

type Message = {
    id: number;
    content: string | null;
    type: string;
    mediaUrl: string | null;
    direction: "inbound" | "outbound";
    createdAt: string;
};

export default function ChatWindow({ phoneNumber }: { phoneNumber: string | null }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!phoneNumber) return;
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [phoneNumber]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchMessages = async () => {
        if (!phoneNumber) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp/messages/${phoneNumber}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !phoneNumber) return;
        await sendToBackend(phoneNumber, 'text', input);
        setInput("");
    };

    const sendToBackend = async (to: string, type: string, content: string | null = null, mediaUrl: string | null = null) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to,
                    type,
                    text: content,
                    mediaUrl
                }),
            });
            fetchMessages();
        } catch (error) {
            console.error("Failed to send message", error);
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !phoneNumber) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp/media/upload`, {
                method: 'POST',
                body: formData
            });

            if (uploadRes.ok) {
                const { url } = await uploadRes.json();
                let type = 'document';
                if (file.type.startsWith('image/')) type = 'image';
                else if (file.type.startsWith('video/')) type = 'video';
                else if (file.type.startsWith('audio/')) type = 'audio';

                await sendToBackend(phoneNumber, type, null, url);
            }
        } catch (error) {
            console.error("Upload failed", error);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (!phoneNumber) {
        return (
            <div className="flex-1 flex items-center justify-center text-neutral-500">
                Select a conversation to start chatting
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-neutral-950">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.direction === "outbound"
                                ? "bg-teal-600 text-white rounded-tr-none"
                                : "bg-neutral-800 text-white rounded-tl-none"
                                }`}
                        >
                            {msg.type === "text" && <p>{msg.content}</p>}
                            {msg.type === "image" && (
                                <NextImage
                                    src={msg.mediaUrl || ""}
                                    alt="Sent image"
                                    width={384}
                                    height={384}
                                    className="rounded-lg max-w-sm w-auto h-auto"
                                    unoptimized
                                />
                            )}
                            {msg.type === "audio" && (
                                <audio controls src={msg.mediaUrl || ""} className="mt-1" />
                            )}
                            {msg.type === "video" && (
                                <video controls src={msg.mediaUrl || ""} className="rounded-lg max-w-sm" />
                            )}
                            {msg.type === "document" && (
                                <a href={msg.mediaUrl || "#"} target="_blank" rel="noopener noreferrer" className="underline">
                                    View Document
                                </a>
                            )}
                            <div className={`text-[10px] mt-1 ${msg.direction === "outbound" ? "text-teal-200" : "text-neutral-400"}`}>
                                {format(new Date(msg.createdAt), "HH:mm")}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-neutral-900 border-t border-neutral-800">
                <form onSubmit={sendMessage} className="flex gap-2 items-center">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-neutral-400 hover:text-white"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-neutral-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />

                    {input.trim() ? (
                        <Button type="submit" size="icon" className="bg-teal-600 hover:bg-teal-700 rounded-full h-10 w-10">
                            <Send className="h-5 w-5" />
                        </Button>
                    ) : (
                        <Button type="button" size="icon" className="bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-full h-10 w-10">
                            <Mic className="h-5 w-5" />
                        </Button>
                    )}
                </form>
            </div>
        </div>
    );
}
