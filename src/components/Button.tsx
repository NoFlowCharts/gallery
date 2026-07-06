"use client";

import React from "react";
import Link from "next/link";

type ButtonProps = {
    text?: string;
    onClick?: () => void;
    disabled?: boolean;
    active?: boolean;
    variant?: 'primary' | 'secondary';
    className?: string;
    href?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    rel?: string;
    type?: 'button' | 'submit' | 'reset';
    gaEvent?: string;
    gaEventParams?: Record<string, string | number>;
};

const Button: React.FC<ButtonProps> = ({
    text,
    onClick,
    disabled = false,
    active = false,
    variant = 'primary',
    className = "",
    href,
    target,
    rel,
    type = 'button',
    gaEvent,
    gaEventParams,
}) => {
    const baseClasses = [
        "text-[18px] font-light pt-2 pb-2.5 px-6 transition duration-300 ease-in-out inline-block text-center",
        variant === 'primary'
            ? disabled
                ? "cursor-not-allowed bg-[#E3DFE0] text-[#6F4952]"
                : active
                    ? "bg-black text-txt-white-prim hover:bg-maline"
                    : "bg-black text-txt-white-prim dark:bg-white dark:text-txt-black-prim hover:bg-black dark:hover:bg-white dark:hover:text-txt-black-prim"
            : disabled
                ? "cursor-not-allowed border border-gray-500 text-gray-300"
                : active
                    ? "bg-black text-txt-white-prim hover:bg-maline"
                    : "dashed-border bg-border/10 dark:text-txt-white-prim text-txt-black-prim dark:hover:bg-white hover:bg-black dark:hover:text-txt-black-prim hover:text-txt-white-prim",
        className,
    ].join(" ");

    if (href) {
        const isExternal = href.startsWith('http') || href.startsWith('//');
        const isAnchor = href.startsWith('#');

        if (isAnchor) {
            const handleAnchorClick = (e: React.MouseEvent) => {
                e.preventDefault();
                onClick?.();
                const targetId = href.slice(1);
                const el = document.getElementById(targetId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => {
                        history.replaceState(null, '', window.location.pathname + window.location.search);
                    }, 50);
                }
            };

            return (
                <a href={href} onClick={handleAnchorClick} className={baseClasses}>
                    {text}
                </a>
            );
        }

        if (isExternal) {
            return (
                <a
                    href={href}
                    target={target}
                    rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
                    onClick={() => { onClick?.(); }}
                    className={baseClasses}
                >
                    {text}
                </a>
            );
        }

        return (
            <Link href={href} onClick={() => { onClick?.(); }} className={baseClasses}>
                {text}
            </Link>
        );
    }

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={() => { onClick?.(); }}
            className={baseClasses}
        >
            {text}
        </button>
    );
};

export default Button;