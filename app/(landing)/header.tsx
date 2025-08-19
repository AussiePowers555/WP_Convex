'use client'
import Link from 'next/link'
import { ChatMaxingIconColoured } from '@/components/logo'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import React from 'react'
import { cn } from '@/lib/utils'

const menuItems = [
    { name: 'Features', href: '#link' },
    { name: 'Solution', href: '#link' },
    { name: 'Pricing', href: '#link' },
    { name: 'About', href: '#link' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="logo"
                                className="flex items-center space-x-2"
                            >
                                <ChatMaxingIconColoured />
                                <span className="text-2xl font-bold">Logo</span>
                                <Badge variant="outline" className="ml-3 hidden sm:block">
                                    v1.0.0
                                </Badge>
                            </Link>
                            <Button
                                variant="ghost"
                                className="lg:hidden"
                                onClick={() => setMenuState(!menuState)}
                                aria-label="Toggle Menu"
                            >
                                {menuState ? <X /> : <Menu />}
                            </Button>
                        </div>
                        <div
                            className={cn(
                                "max-lg:absolute max-lg:top-full max-lg:mt-1 flex-col rounded-2xl border border-zinc-100 p-8 shadow-2xl dark:border-zinc-800 lg:flex max-lg:w-full lg:flex-row lg:items-center lg:gap-6 lg:border-none lg:p-0 lg:shadow-none",
                                menuState ? "flex" : "hidden"
                            )}
                        >
                            <ul className="flex flex-col gap-6 text-zinc-900 dark:text-zinc-300 lg:flex-row lg:gap-0">
                                {menuItems.map((item, idx) => (
                                    <li key={idx}>
                                        <Link
                                            href={item.href}
                                            className="duration-300 hover:text-zinc-900 dark:hover:text-zinc-50 lg:px-6"
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center lg:mt-0">
                                <Link href="/dashboard">
                                    <Button>Go to Dashboard</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}