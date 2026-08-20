"use client";
import {
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import AIConversation from '@/components/ai-conversation';
import {ToolsArea} from "@/components/tool-area"
import { useIsMobile } from "@/hooks/use-mobile"



export default function Page() {
    const isMobile = useIsMobile()

    return (
        <div className="flex h-full w-full flex-col">
            <ResizablePanelGroup
                key={isMobile ? "vertical" : "horizontal"}
                orientation={isMobile ? "vertical" : "horizontal"}
                className="min-h-0 flex-1"
            >
                <ResizablePanel defaultSize="40%" minSize="25%">
                    <AIConversation />
                </ResizablePanel>

                <ResizablePanel defaultSize="60%">
                    <ToolsArea />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
