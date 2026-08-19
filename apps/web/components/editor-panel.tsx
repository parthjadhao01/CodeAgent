"use client"

import { useState } from "react"
import { Blocks, Files, GitBranch, Play, Search, Settings } from "lucide-react"

import { cn } from "@/lib/utils"

const SIDE_ICONS = [Files, Search, GitBranch, Play, Blocks]

const BOTTOM_TABS = ["Problems", "Output", "Debug Console", "Terminal"]

const SHORTCUTS = [
    { label: "Go To File", keys: "⌘P" },
    { label: "Toggle Chat", keys: "⌘G" },
    { label: "Agent", keys: "⌘I" },
]

export function EditorPanel() {
    const [activeTab, setActiveTab] = useState("Terminal")

    return (
        <div className="flex h-full">
            <div className="flex w-11 shrink-0 flex-col items-center gap-4 border-r py-3">
                {SIDE_ICONS.map((Icon, i) => (
                    <button
                        key={i}
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground",
                            i === 0 && "bg-accent text-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                    </button>
                ))}
                <button className="mt-auto flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                    <Settings className="h-4 w-4" />
                </button>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                    {SHORTCUTS.map((shortcut) => (
                        <div key={shortcut.label} className="flex items-center gap-2">
                            <span>{shortcut.label}</span>
                            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                                {shortcut.keys}
                            </kbd>
                        </div>
                    ))}
                </div>

                <div className="flex h-56 shrink-0 flex-col border-t">
                    <div className="flex items-center gap-4 border-b px-3 text-xs">
                        {BOTTOM_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "border-b-2 border-transparent py-2 uppercase tracking-wide text-muted-foreground hover:text-foreground",
                                    activeTab === tab && "border-foreground text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-auto p-3 font-mono text-xs text-muted-foreground">
                        {activeTab === "Terminal" ? (
                            <div>agent@sandbox:~$</div>
                        ) : (
                            <div>No {activeTab.toLowerCase()} to show.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
