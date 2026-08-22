"use client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { clearStoredConnection } from "@/lib/github"

function SidebarHeaderBar() {
    const router = useRouter()

    const handleLogout = async () => {
        await fetch("/api/session", { method: "DELETE" })
        clearStoredConnection()
        router.push("/")
    }

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium">Refactoring code</h1>
                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="hidden dark:text-foreground sm:flex"
                        onClick={handleLogout}
                    >
                        <LogOut />
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    )
}

export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <SidebarProvider
            style={
                {
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar />
            <SidebarInset>
                <SidebarHeaderBar />
                <main className="h-[calc(100svh-4rem)] overflow-hidden">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
