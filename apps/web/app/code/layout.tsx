"use client"
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"

function SidebarHeaderBar() {
    const {open} = useSidebar()
    return (
        <>
            {!open ? (
                <SidebarTrigger className="ml-5 mt-3"></SidebarTrigger>
            ) : (
                <div className="ml-5 mt-3 h-7"></div>
            )}
        </>
    )
}

export default function Layout({ children }: { children: React.ReactNode }) {
   
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="">
                <SidebarHeaderBar />
                <main className="h-[calc(100svh-4rem)] overflow-hidden">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
