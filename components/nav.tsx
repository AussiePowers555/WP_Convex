"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
} from "@/components/ui/sidebar"
import {
    Home,
    Briefcase,
    Bike,
    Banknote,
    FileText,
    Settings,
    MessageSquare,
    ClipboardCheck,
    Contact,
    Mail,
    LayoutGrid,
    Shield,
    Users,
} from "lucide-react"

const mainNavItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/cases", label: "Case Management", icon: Briefcase },
    { href: "/fleet", label: "Fleet Tracking", icon: Bike },
    { href: "/financials", label: "Financials", icon: Banknote },
    { href: "/commitments", label: "Commitments", icon: ClipboardCheck },
    { href: "/contacts", label: "Contacts", icon: Contact },
    { href: "/documents", label: "Documents", icon: FileText },
    { href: "/interactions", label: "Interactions", icon: MessageSquare },
    { href: "/ai-email", label: "AI Email", icon: Mail },
]

const settingsNavItems = [
    { href: "/admin", label: "Admin Dashboard", icon: Shield },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
]

export function Nav() {
    const pathname = usePathname()

    const rentalAgreementRegex = /^\/rental-agreement\/.*/;
    const isRentalAgreementPage = rentalAgreementRegex.test(pathname);

    return (
        <div className="flex h-full flex-col">
            <SidebarHeader>
                <Link href="/" className="flex items-center gap-2">
                    <Bike className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">PBikeRescue</span>
                </Link>
            </SidebarHeader>
            <SidebarContent className="flex-1">
                <SidebarMenu>
                    {mainNavItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === item.href || (item.href === "/fleet" && isRentalAgreementPage)}
                            >
                                <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                 <SidebarGroup>
                    <SidebarGroupLabel>Settings</SidebarGroupLabel>
                    <SidebarMenu>
                        {settingsNavItems.map((item) => (
                             <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                                    <Link href={item.href}>
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarFooter>
        </div>
    )
}