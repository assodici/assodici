import type {ComponentProps, ReactNode} from "react";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";
import {LuExternalLink} from "react-icons/lu";
import {SiGithub} from "react-icons/si";
import type {VariantProps} from "class-variance-authority";
import type {IconType} from "react-icons";
import {cn} from "@/lib/utils";

type IconRule = {
    matches: Array<string | RegExp>;
    icon: ReactNode;
};

type IconRegistry = {
    rules: IconRule[];
    defaultIcon: ReactNode;
};

const ICON_CLASSNAME = "h-[1em] w-[1em]";

function makeIcon(Icon: IconType) {
    return <Icon className={ICON_CLASSNAME} aria-hidden />;
}

const defaultIconRegistry: IconRegistry = {
    rules: [
        {
            matches: ["github.com"],
            icon: makeIcon(SiGithub),
        },
    ],
    defaultIcon: makeIcon(LuExternalLink),
};

interface ExternalLinkButtonProps
    extends Omit<ComponentProps<"a">, "href" | "target" | "rel">,
        VariantProps<typeof buttonVariants> {
    href: string;
    iconRegistry?: IconRegistry;
    showText?: boolean;
    children?: ReactNode;
}

function getIconForUrl(url: string, iconRegistry: IconRegistry) {
    for (const rule of iconRegistry.rules) {
        const matches = rule.matches.some((match) =>
            typeof match === "string" ? url.includes(match) : match.test(url),
        );

        if (matches) {
            return rule.icon;
        }
    }

    return iconRegistry.defaultIcon;
}

export function ExternalLinkButton({
    href,
    iconRegistry = defaultIconRegistry,
    showText = false,
    children,
    variant = "default",
    size = "default",
    className,
    ...props
}: ExternalLinkButtonProps) {
    const icon = getIconForUrl(href, iconRegistry);
    const inferredAriaLabel = !showText
        ? (() => {
            try {
                const hostname = new URL(href).hostname.replace(/^www\./, "");
                return `Open ${hostname}`;
            } catch {
                return "Open external link";
            }
        })()
        : undefined;
    const ariaLabel = props["aria-label"] ?? inferredAriaLabel;

    return (
        <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
            className={cn(buttonVariants({variant, size}), "gap-2", className)}
            {...props}
        >
            {icon}
            {showText && children}
        </Link>
    );
}
