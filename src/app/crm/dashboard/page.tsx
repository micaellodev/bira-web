"use client";

import { useState } from "react";
import ChatList from "@/components/crm/ChatList";
import ChatWindow from "@/components/crm/ChatWindow";

export default function CrmDashboard() {
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

    return (
        <div className="flex h-screen overflow-hidden">
            <ChatList selectedId={selectedPhone} onSelect={setSelectedPhone} />
            <ChatWindow phoneNumber={selectedPhone} />
        </div>
    );
}
