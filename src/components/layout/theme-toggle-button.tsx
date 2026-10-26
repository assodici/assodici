"use client"
import * as React from "react"
import {Moon, Sun} from "lucide-react";
import {useTheme} from "next-themes"
import {Button} from "@/components/ui/button"

export function ThemeToggleButton({className}: {className?: string}) {
    const {theme, resolvedTheme, setTheme} = useTheme()

    const toggleTheme = () => {
        const current = theme === "system" ? resolvedTheme : theme
        setTheme(current === "dark" ? "light" : "dark")
    }

    const iconBase = "h-[1em] w-[1em] transition-all"

    return (
        <Button
            variant="ghost"
            size="icon-lg"
            onClick={toggleTheme}
            aria-label="Changer de thème clair ou sombre"
            className={className}
        >
            <Sun className={`${iconBase} dark:scale-0 dark:opacity-0`}/>
            <Moon className={`${iconBase} absolute scale-0 opacity-0 dark:scale-100 dark:opacity-100`}/>
        </Button>
    )
}
