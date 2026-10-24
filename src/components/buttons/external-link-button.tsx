import type {ComponentProps, ReactNode} from "react";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";
import {ExternalLink, type LucideIcon} from "lucide-react";
import type {VariantProps} from "class-variance-authority";
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

function makeIcon(Icon: LucideIcon) {
    return <Icon className={ICON_CLASSNAME} aria-hidden />;
}

// lucide dropped brand icons in v1, so the GitHub mark is inlined.
const githubIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASSNAME} aria-hidden>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
);

const defaultIconRegistry: IconRegistry = {
    rules: [
        {
            matches: ["github.com"],
            icon: githubIcon,
        },
    ],
    defaultIcon: makeIcon(ExternalLink),
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
