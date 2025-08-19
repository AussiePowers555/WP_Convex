"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Nav } from "@/components/nav"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <Nav />
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center gap-2 p-4 border-b">
          <h1 className="text-lg font-semibold">PBikeRescue Management</h1>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}