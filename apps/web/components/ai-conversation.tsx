"use client"

import { useState } from "react"

import AIPromptBar from "@/components/ai-prompt-bar"
import { cn } from "@/lib/utils"

type Message = {
    role: "user" | "assistant"
    content: string
}

function AIConversation() {
    const [messages, setMessages] = useState<Message[]>([])

    const handleSendMessage = (message: string) => {
        if (!message.trim()) return
        setMessages((prev) => [...prev, { role: "user", content: message }])
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-6">
                {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Ask a question or describe what you&apos;d like to build.
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {messages.map((message, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                                    message.role === "user"
                                        ? "ml-auto bg-primary text-primary-foreground"
                                        : "bg-muted"
                                )}
                            >
                                {message.content}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <AIPromptBar
                placeholder="Ask the agent to build features, fix bugs, or work on your code"
                onSendMessage={(message) => handleSendMessage(message)}
            />
        </div>
    )
}

export default AIConversation
