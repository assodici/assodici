"use client"

import * as React from "react"
import {LuCheck, LuCopy} from "react-icons/lu"
import {Button} from "@/components/ui/button"

type CopyToClipboardButtonProps = {
    value: string
    label?: string
    className?: string
    disabled?: boolean
}

async function copyText(text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return
    }

    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.setAttribute("readonly", "true")
    textarea.style.position = "fixed"
    textarea.style.top = "0"
    textarea.style.left = "0"
    textarea.style.opacity = "0"

    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    const ok = document.execCommand("copy")
    document.body.removeChild(textarea)

    if (!ok) throw new Error("Copy failed")
}

export function CopyToClipboardButton({
                                          value,
                                          label,
                                          className,
                                          disabled,
                                      }: CopyToClipboardButtonProps) {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = async () => {
        try {
            await copyText(value)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1200)
        } catch (error) {
            console.error("Failed to copy:", error)
        }
    }

    const iconBase = "h-[1em] w-[1em] transition-all"

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            aria-label={copied ? "Copié" : "Copier"}
            disabled={disabled}
            className={className}
        >
            <LuCopy className={`${iconBase} ${copied ? "scale-0 opacity-0" : ""}`}/>
            <LuCheck
                className={`${iconBase} absolute scale-0 opacity-0 ${
                    copied ? "scale-100 opacity-100" : ""
                }`}
            />
            <span className="sr-only">{label ?? ""}</span>
        </Button>
    )
}
