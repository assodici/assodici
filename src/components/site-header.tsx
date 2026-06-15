import Link from "next/link";
import {ThemeToggleButton} from "@/components/buttons/theme-toggle-button";
import {ButtonGroup} from "@/components/ui/button-group";
import Image from "next/image";

const NAV = [
    {href: "/", label: "Accueil"},
    {href: "/contact", label: "Contact"},
];

export function SiteHeader() {
    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="page-container py-3 flex items-center justify-between gap-4">

                <Link href="/" className="flex items-center shrink-0">
                    <Image
                        src="/globe.svg"
                        alt="Logo"
                        width={96}
                        height={24}
                        className="h-6 w-auto dark:invert"
                        priority
                    />
                </Link>

                <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                    {NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="hover:text-foreground transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <ButtonGroup>
                    <ThemeToggleButton/>
                </ButtonGroup>
            </div>
        </header>
    );
}
