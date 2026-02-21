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
        <div className="flex-1 flex flex-col h-full bg-neutral-950/50 backdrop-blur-sm relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar z-10 scroll-smooth">
                {messages.map((msg, index) => {
                    const isSequence = index > 0 && messages[index - 1].direction === msg.direction;

                    return (
                        <div
                            key={msg.id}
                            className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"} ${isSequence ? "mt-2" : "mt-6"}`}
                        >
                            <div
                                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 shadow-md backdrop-blur-md transition-all duration-300 hover:shadow-lg
                                    ${msg.direction === "outbound"
                                        ? `bg-linear-to-br from-teal-600 to-teal-800 text-white border border-teal-500/30 ${isSequence ? "rounded-tr-md" : "rounded-tr-none"}`
                                        : `bg-neutral-800/80 text-neutral-100 border border-neutral-700/50 ${isSequence ? "rounded-tl-md" : "rounded-tl-none"}`
                                    }`}
                            >
                                {msg.type === "text" && <p className="leading-relaxed text-[15px] whitespace-pre-wrap break-words">{msg.content}</p>}
                                {msg.type === "image" && (
                                    <div className="relative group overflow-hidden rounded-xl border border-white/10 mt-1 mb-2">
                                        <NextImage
                                            src={msg.mediaUrl || ""}
                                            alt="Sent image"
                                            width={384}
                                            height={384}
                                            className="w-full h-auto object-cover max-h-[300px] transition-transform duration-500 group-hover:scale-105"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <ImageIcon className="w-8 h-8 text-white/70" />
                                        </div>
                                    </div>
                                )}
                                {msg.type === "audio" && (
                                    <div className="bg-black/20 rounded-full p-1 pr-4 flex items-center gap-2 mt-1 mb-1">
                                        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300 shrink-0">
                                            <Mic className="w-5 h-5" />
                                        </div>
                                        <audio controls src={msg.mediaUrl || ""} className="h-8 w-48 md:w-64 opacity-90 custom-audio" />
                                    </div>
                                )}
                                {msg.type === "video" && (
                                    <video controls src={msg.mediaUrl || ""} className="rounded-xl w-full max-w-sm border border-white/10 mt-1 mb-2 shadow-inner" />
                                )}
                                {msg.type === "document" && (
                                    <a href={msg.mediaUrl || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-black/20 rounded-xl hover:bg-black/30 transition-colors mt-1 mb-1 border border-white/5 group">
                                        <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300 group-hover:bg-teal-500/30 transition-colors">
                                            <Paperclip className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm underline group-hover:text-teal-200 transition-colors">Ver Documento</span>
                                            <span className="text-xs text-white/50">Archivo adjunto</span>
                                        </div>
                                    </a>
                                )}
                                <div className={`text-[10px] sm:text-[11px] font-medium mt-1.5 flex justify-end items-center gap-1.5
                                    ${msg.direction === "outbound" ? "text-teal-100/70" : "text-neutral-400"}`}>
                                    {format(new Date(msg.createdAt), "HH:mm")}
                                    {msg.direction === "outbound" && (
                                        <span className="text-teal-300 text-[10px] leading-none">✓✓</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            <div className="p-4 bg-transparent z-20">
                <form onSubmit={sendMessage} className="flex gap-2 items-end max-w-4xl mx-auto bg-neutral-900/80 backdrop-blur-xl border border-neutral-800/80 p-2 rounded-3xl shadow-2xl">
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
                        className="rounded-full h-12 w-12 text-neutral-400 hover:text-teal-400 hover:bg-teal-500/10 transition-colors shrink-0 mb-0.5"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-transparent text-white border-0 px-2 py-3 focus:outline-none focus:ring-0 text-[15px] placeholder:text-neutral-500 min-h-[48px]"
                    />

                    {input.trim() ? (
                        <Button type="submit" size="icon" className="rounded-full h-12 w-12 bg-linear-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white shadow-lg shadow-teal-900/50 shrink-0 mb-0.5 transition-all hover:scale-105 active:scale-95">
                            <Send className="h-5 w-5 mr-0.5 mt-0.5" />
                        </Button>
                    ) : (
                        <Button type="button" size="icon" className="rounded-full h-12 w-12 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white shrink-0 mb-0.5 transition-colors">
                            <Mic className="h-5 w-5" />
                        </Button>
                    )}
                </form>
            </div>
        </div>
    );
}
