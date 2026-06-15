"use client"
import * as React from "react"
import {LuMoon, LuSun} from "react-icons/lu";
import {useTheme} from "next-themes"
import {Button} from "@/components/ui/button"

export function ThemeToggleButton() {
    const {theme, resolvedTheme, setTheme} = useTheme()

    const toggleTheme = () => {
        const current = theme === "system" ? resolvedTheme : theme
        setTheme(current === "dark" ? "light" : "dark")
    }

    const iconBase = "h-[1em] w-[1em] transition-all"

    return (
        <Button
            variant="default"
            size="icon"
            onClick={toggleTheme}
            aria-label={"theme"}
        >
            <LuSun className={`${iconBase} dark:scale-0 dark:opacity-0`}/>
            <LuMoon className={`${iconBase} absolute scale-0 opacity-0 dark:scale-100 dark:opacity-100`}/>
        </Button>
    )
}
