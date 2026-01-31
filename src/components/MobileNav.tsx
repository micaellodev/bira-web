'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

interface NavItem {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: 'default' | 'danger';
}

interface MobileNavProps {
    items: NavItem[];
}

export function MobileNav({ items }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleNavClick = (item: NavItem) => {
        if (item.onClick) {
            item.onClick();
        } else if (item.href) {
            router.push(item.href);
        }
        setIsOpen(false);
    };

    const menuContent = (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                onClick={() => setIsOpen(false)}
            />

            {/* Slide-in Menu */}
            <div
                className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-br from-gray-900 via-black to-gray-900 backdrop-blur-md border-l-2 border-white/30 shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b-2 border-white/20 bg-white/5">
                        <h2 className="text-lg font-bold text-white">Menú</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-lg hover:bg-white/20 transition-colors bg-white/10"
                            aria-label="Close menu"
                        >
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-3">
                            {items.map((item, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => handleNavClick(item)}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium text-base shadow-lg ${item.variant === 'danger'
                                            ? 'bg-red-500/40 hover:bg-red-500/50 text-red-100 border-2 border-red-500/60'
                                            : 'bg-white/20 hover:bg-white/30 text-white border-2 border-white/30'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Hamburger Button - Always visible, not portalled */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative z-20"
                aria-label="Toggle menu"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isOpen ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                </svg>
            </button>

            {/* Render portal only on client side */}
            {mounted && isOpen && createPortal(menuContent, document.body)}
        </>
    );
}
