import React from 'react'
import {
  Activity,
  Bot,
  Code2,
  GitPullRequest,
  Globe,
  ListTree,
  type LucideIcon,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
      <Icon className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function ToolsArea() {
  return (
    <Tabs defaultValue="Progress" className="flex h-full w-full flex-col">
      <TabsList className="grid w-full shrink-0 grid-cols-6">
        <TabsTrigger value="Progress">
          <Activity />
          <span className="hidden sm:inline">Progress</span>
        </TabsTrigger>
        <TabsTrigger value="Browser">
          <Globe />
          <span className="hidden sm:inline">Browser</span>
        </TabsTrigger>
        <TabsTrigger value="Agents">
          <Bot />
          <span className="hidden sm:inline">Agents</span>
        </TabsTrigger>
        <TabsTrigger value="Editor">
          <Code2 />
          <span className="hidden sm:inline">Editor</span>
        </TabsTrigger>
        <TabsTrigger value="Changes">
          <ListTree />
          <span className="hidden sm:inline">Changes</span>
        </TabsTrigger>
        <TabsTrigger value="PR">
          <GitPullRequest />
          <span className="hidden sm:inline">PR</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="Progress" className="min-h-0 flex-1">
        <Card className="h-full w-full">
          <EmptyState
            icon={Activity}
            title="No progress yet"
            description="Once the agent starts working, its step-by-step progress will show up here."
          />
        </Card>
      </TabsContent>
      <TabsContent value="Browser" className="min-h-0 flex-1">
        <Card className="h-full w-full">
          <EmptyState
            icon={Globe}
            title="No browser session yet"
            description="A live preview will appear here once the agent opens a browser."
          />
        </Card>
      </TabsContent>
      <TabsContent value="Agents" className="min-h-0 flex-1">
        <Card className="h-full w-full">
          <EmptyState
            icon={Bot}
            title="No agents running"
            description="Sub-agents will show up here when the agent delegates work."
          />
        </Card>
      </TabsContent>
      <TabsContent value="Editor" className="min-h-0 flex-1">
        <Card className="h-full w-full">
          <EmptyState
            icon={Code2}
            title="No file open"
            description="Open a file from the project to start editing."
          />
        </Card>
      </TabsContent>
      <TabsContent value="Changes" className="min-h-0 flex-1">
        <Card className="h-full w-full">
          <EmptyState
            icon={ListTree}
            title="No changes yet"
            description="File changes will appear here once the agent starts editing your code."
          />
        </Card>
      </TabsContent>
      <TabsContent value="PR" className="min-h-0 flex-1">
        <Card className="h-full w-full">
          <EmptyState
            icon={GitPullRequest}
            title="No pull request yet"
            description="A pull request will appear here once the agent opens one."
          />
        </Card>
      </TabsContent>
    </Tabs>
  )
}



