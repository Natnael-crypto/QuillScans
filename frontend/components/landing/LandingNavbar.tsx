'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Zap, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";

const navigation = [
    {
        name: 'Products',
        href: '#',
        children: [
            { name: 'Document Extraction', description: 'Extract data from any document', href: '#' },
            { name: 'Expense Management', description: 'Track and manage expenses', href: '#' },
            { name: 'Invoice Processing', description: 'Automate invoice workflows', href: '#' },
        ]
    },
    {
        name: 'Solutions',
        href: '#',
        children: [
            { name: 'For Finance Teams', description: 'Streamline accounting workflows', href: '#' },
            { name: 'For Small Business', description: 'Simple document automation', href: '#' },
            { name: 'For Enterprise', description: 'Scale with security', href: '#' },
        ]
    },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Resources', href: '#' },
];

export default function LandingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            isScrolled
                ? "bg-white/90 backdrop-blur-lg shadow-sm"
                : "bg-transparent"
        )}>
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">

                        <img
                            src="/logo.png"
                            alt="Logo"
                            width={30}
                            height={30}
                        ></img>

                        <span className={cn(
                            "text-xl font-bold transition-colors",
                            isScrolled ? "text-slate-900" : "text-white"
                        )}>
                            QuillScans
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navigation.map((item) => (
                            <div key={item.name} className="relative">
                                {item.children ? (
                                    <button
                                        onMouseEnter={() => setOpenDropdown(item.name)}
                                        onMouseLeave={() => setOpenDropdown(null)}
                                        className={cn(
                                            "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                            isScrolled
                                                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                                : "text-white/80 hover:text-white hover:bg-white/10"
                                        )}
                                    >
                                        {item.name}
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <a
                                        href={item.href}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                            isScrolled
                                                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                                : "text-white/80 hover:text-white hover:bg-white/10"
                                        )}
                                    >
                                        {item.name}
                                    </a>
                                )}

                                {/* Dropdown */}
                                {item.children && openDropdown === item.name && (
                                    <div
                                        onMouseEnter={() => setOpenDropdown(item.name)}
                                        onMouseLeave={() => setOpenDropdown(null)}
                                        className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 animate-in fade-in slide-in-from-top-2"
                                    >
                                        {item.children.map((child) => (
                                            <a
                                                key={child.name}
                                                href={child.href}
                                                className="block px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                <p className="text-sm font-medium text-slate-900">{child.name}</p>
                                                <p className="text-sm text-slate-500">{child.description}</p>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* CTA Buttons */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Link href="/auth?mode=login">
                            <Button
                                variant={isScrolled ? "ghost" : "ghost"}
                                className={!isScrolled ? "text-white hover:bg-white/10" : ""}
                            >
                                Sign in
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={cn(
                            "lg:hidden p-2 rounded-lg transition-colors",
                            isScrolled
                                ? "text-slate-600 hover:bg-slate-100"
                                : "text-white hover:bg-white/10"
                        )}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-slate-200/20">
                        <nav className="space-y-1">
                            {navigation.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "block px-4 py-2 rounded-lg text-sm font-medium",
                                        isScrolled
                                            ? "text-slate-600 hover:bg-slate-100"
                                            : "text-white/80 hover:bg-white/10"
                                    )}
                                >
                                    {item.name}
                                </a>
                            ))}
                        </nav>
                        <div className="mt-4 pt-4 border-t border-slate-200/20 space-y-2">
                            <Link href="/auth?mode=login" className="block">
                                <Button variant="outline" className="w-full">Sign in</Button>
                            </Link>

                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
