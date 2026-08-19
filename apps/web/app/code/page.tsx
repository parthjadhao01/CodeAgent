"use client";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import AIConversation from '@/components/ai-conversation';
import { EditorPanel } from "@/components/editor-panel"
import { cn } from "@/lib/utils"

const TABS = ["Progress", "Browser", "Agents", "Editor", "Changes", "PR"]

export default function Page() {
    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
                <span className="text-sm font-medium">New session</span>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {TABS.map((tab, i) => (
                        <button
                            key={tab}
                            className={cn(
                                "hover:text-foreground",
                                i === 3 && "text-foreground"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
                <ResizablePanel defaultSize="40%" minSize="25%">
                    <AIConversation />
                </ResizablePanel>
                
                <ResizablePanel defaultSize="60%">
                    <EditorPanel />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
