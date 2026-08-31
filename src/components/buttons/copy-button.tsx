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
    await navigator.clipboard.writeText(text)
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
